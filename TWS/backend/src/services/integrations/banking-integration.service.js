const axios = require('axios');
const crypto = require('crypto');
const { Transaction, BankAccount } = require('../../models/Finance');
const { IntegrationLog } = require('../../models/Integration');

class BankingService {
  constructor(integration) {
    this.integration = integration;
    this.provider = integration.provider;
    this.credentials = integration.credentials;
  }

  async syncTransactions(accountId, startDate, endDate) {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;

    try {
      let transactions = [];
      
      switch (this.provider) {
        case 'plaid':
          transactions = await this.syncFromPlaid(accountId, startDate, endDate);
          break;
        case 'yodlee':
          transactions = await this.syncFromYodlee(accountId, startDate, endDate);
          break;
        case 'openbanking':
          transactions = await this.syncFromOpenBanking(accountId, startDate, endDate);
          break;
        case 'teller':
          transactions = await this.syncFromTeller(accountId, startDate, endDate);
          break;
        case 'mx':
          transactions = await this.syncFromMX(accountId, startDate, endDate);
          break;
        default:
          throw new Error(`Unsupported banking provider: ${this.provider}`);
      }

      // Process each transaction
      for (const transaction of transactions) {
        try {
          recordsProcessed++;
          
          // Check if transaction already exists
          const existingTransaction = await Transaction.findOne({
            orgId: this.integration.orgId,
            'bankReconciliation.bankTransactionId': transaction.externalId
          });

          const transactionData = {
            type: transaction.amount > 0 ? 'revenue' : 'expense',
            category: this.mapTransactionCategory(transaction.category),
            amount: Math.abs(transaction.amount),
            description: transaction.description,
            date: new Date(transaction.date),
            reference: transaction.reference,
            bankReconciliation: {
              reconciled: false,
              bankTransactionId: transaction.externalId,
              bankAccountId: accountId
            },
            integration: {
              provider: this.provider,
              externalId: transaction.externalId,
              accountId: accountId
            },
            orgId: this.integration.orgId
          };

          if (existingTransaction) {
            await Transaction.findByIdAndUpdate(existingTransaction._id, transactionData);
            recordsUpdated++;
          } else {
            await Transaction.create(transactionData);
            recordsCreated++;
          }

        } catch (error) {
          recordsFailed++;
          console.error(`Failed to process transaction ${transaction.externalId}:`, error);
        }
      }

      // Log the sync operation
      await this.logSyncOperation('sync', 'success', 
        `Synced ${recordsCreated} new and ${recordsUpdated} updated transactions`, 
        {
          accountId,
          recordsProcessed,
          recordsCreated,
          recordsUpdated,
          recordsFailed,
          duration: Date.now() - startTime
        }
      );

      return {
        success: true,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        duration: Date.now() - startTime
      };

    } catch (error) {
      await this.logSyncOperation('sync', 'error', 
        `Failed to sync transactions: ${error.message}`, 
        { accountId, error: error.message, duration: Date.now() - startTime }
      );
      
      throw error;
    }
  }

  async syncFromPlaid(accountId, startDate, endDate) {
    const response = await axios.post('https://production.plaid.com/transactions/get', {
      client_id: this.credentials.clientId,
      secret: this.credentials.secretKey,
      access_token: this.credentials.accessToken,
      start_date: startDate,
      end_date: endDate,
      account_ids: [accountId],
      count: 500
    });

    return response.data.transactions.map(transaction => ({
      externalId: transaction.transaction_id,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.name,
      reference: transaction.transaction_id,
      category: transaction.category?.[0] || 'Other',
      merchant: transaction.merchant_name,
      accountId: transaction.account_id
    }));
  }

  async syncFromYodlee(accountId, startDate, endDate) {
    const response = await axios.get(`https://sandbox.api.yodlee.com/ysl/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Api-Version': '1.1'
      },
      params: {
        accountId: accountId,
        fromDate: startDate,
        toDate: endDate,
        top: 500
      }
    });

    return response.data.transaction.map(transaction => ({
      externalId: transaction.id.toString(),
      amount: transaction.amount.amount,
      date: transaction.date,
      description: transaction.description.simple,
      reference: transaction.id.toString(),
      category: transaction.category,
      merchant: transaction.merchant?.name,
      accountId: transaction.accountId.toString()
    }));
  }

  async syncFromOpenBanking(accountId, startDate, endDate) {
    // This would depend on the specific Open Banking provider (e.g., Open Banking UK, PSD2, etc.)
    const response = await axios.get(`${this.credentials.baseUrl}/accounts/${accountId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Accept': 'application/json'
      },
      params: {
        fromBookingDateTime: startDate,
        toBookingDateTime: endDate,
        pageSize: 500
      }
    });

    return response.data.data.transaction.map(transaction => ({
      externalId: transaction.transactionId,
      amount: parseFloat(transaction.transactionAmount.amount),
      date: transaction.bookingDateTime.split('T')[0],
      description: transaction.remittanceInformationUnstructured || transaction.transactionInformation,
      reference: transaction.transactionId,
      category: transaction.bankTransactionCode?.code || 'Other',
      merchant: transaction.creditorName || transaction.debtorName,
      accountId: accountId
    }));
  }

  async syncFromTeller(accountId, startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/accounts/${accountId}/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`
      },
      params: {
        from: startDate,
        to: endDate,
        limit: 500
      }
    });

    return response.data.map(transaction => ({
      externalId: transaction.id,
      amount: parseFloat(transaction.amount),
      date: transaction.date,
      description: transaction.description,
      reference: transaction.id,
      category: transaction.category || 'Other',
      merchant: transaction.counterparty?.name,
      accountId: accountId
    }));
  }

  async syncFromMX(accountId, startDate, endDate) {
    const response = await axios.get(`${this.credentials.baseUrl}/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`
      },
      params: {
        account_guid: accountId,
        from_date: startDate,
        to_date: endDate,
        page: 1,
        records_per_page: 500
      }
    });

    return response.data.transactions.map(transaction => ({
      externalId: transaction.guid,
      amount: parseFloat(transaction.amount),
      date: transaction.transacted_at.split('T')[0],
      description: transaction.description,
      reference: transaction.guid,
      category: transaction.category || 'Other',
      merchant: transaction.merchant_guid,
      accountId: accountId
    }));
  }

  mapTransactionCategory(externalCategory) {
    const categoryMapping = this.integration.syncSettings?.transactionCategories || [];
    const mapping = categoryMapping.find(m => m.externalCategory === externalCategory);
    return mapping ? mapping.internalCategory : externalCategory;
  }

  async reconcileTransactions(accountId, autoMatch = true) {
    try {
      const unreconciledTransactions = await Transaction.find({
        orgId: this.integration.orgId,
        'bankReconciliation.reconciled': false,
        'bankReconciliation.bankAccountId': accountId
      });

      let reconciledCount = 0;

      for (const transaction of unreconciledTransactions) {
        if (autoMatch) {
          // Try to auto-match with existing transactions
          const match = await this.findMatchingTransaction(transaction);
          if (match) {
            await Transaction.findByIdAndUpdate(transaction._id, {
              'bankReconciliation.reconciled': true,
              'bankReconciliation.reconciledAt': new Date(),
              'bankReconciliation.reconciledBy': this.integration.orgId
            });
            reconciledCount++;
          }
        }
      }

      await this.logOperation('reconciliation', 'success', 
        `Reconciled ${reconciledCount} transactions`, 
        { accountId, reconciledCount }
      );

      return { reconciledCount };

    } catch (error) {
      await this.logOperation('reconciliation', 'error', 
        `Failed to reconcile transactions: ${error.message}`, 
        { accountId, error: error.message }
      );
      throw error;
    }
  }

  async findMatchingTransaction(bankTransaction) {
    // Simple matching logic - can be enhanced with ML
    const tolerance = 0.01; // $0.01 tolerance
    const dateTolerance = 3; // 3 days tolerance

    const match = await Transaction.findOne({
      orgId: this.integration.orgId,
      amount: {
        $gte: bankTransaction.amount - tolerance,
        $lte: bankTransaction.amount + tolerance
      },
      date: {
        $gte: new Date(bankTransaction.date.getTime() - dateTolerance * 24 * 60 * 60 * 1000),
        $lte: new Date(bankTransaction.date.getTime() + dateTolerance * 24 * 60 * 60 * 1000)
      },
      'bankReconciliation.reconciled': false
    });

    return match;
  }

  async handleWebhook(payload, signature, eventType) {
    try {
      let isValid = false;
      let eventData;

      switch (this.provider) {
        case 'plaid':
          isValid = this.verifyPlaidWebhook(payload, signature);
          eventData = JSON.parse(payload);
          break;
        case 'yodlee':
          isValid = this.verifyYodleeWebhook(payload, signature);
          eventData = JSON.parse(payload);
          break;
        default:
          throw new Error(`Webhook verification not implemented for ${this.provider}`);
      }

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      await this.processWebhookEvent(eventData, eventType);

      await this.logOperation('webhook', 'success', 
        `Processed webhook event: ${eventType}`, 
        { eventType, eventData }
      );

    } catch (error) {
      await this.logOperation('webhook', 'error', 
        `Failed to process webhook: ${error.message}`, 
        { eventType, error: error.message }
      );
      throw error;
    }
  }

  verifyPlaidWebhook(payload, signature) {
    const webhookSecret = this.credentials.webhookSecret;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return signature === expectedSignature;
  }

  verifyYodleeWebhook(payload, signature) {
    const webhookSecret = this.credentials.webhookSecret;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return signature === expectedSignature;
  }

  async processWebhookEvent(eventData, eventType) {
    switch (this.provider) {
      case 'plaid':
        await this.processPlaidEvent(eventData);
        break;
      case 'yodlee':
        await this.processYodleeEvent(eventData);
        break;
    }
  }

  async processPlaidEvent(eventData) {
    const { webhook_type, webhook_code } = eventData;
    
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'INITIAL_UPDATE' || webhook_code === 'HISTORICAL_UPDATE') {
          // Trigger transaction sync for the account
          const accountId = eventData.account_id;
          await this.syncTransactions(accountId, 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          );
        }
        break;
    }
  }

  async processYodleeEvent(eventData) {
    const { eventType, data } = eventData;
    
    switch (eventType) {
      case 'TRANSACTION_UPDATE':
        // Trigger transaction sync for the account
        const accountId = data.accountId;
        await this.syncTransactions(accountId,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
        break;
    }
  }

  async logSyncOperation(type, status, message, details = {}) {
    await IntegrationLog.create({
      integrationId: this.integration._id,
      type,
      status,
      message,
      details,
      recordsProcessed: details.recordsProcessed || 0,
      recordsCreated: details.recordsCreated || 0,
      recordsUpdated: details.recordsUpdated || 0,
      recordsFailed: details.recordsFailed || 0,
      duration: details.duration || 0,
      orgId: this.integration.orgId
    });
  }

  async logOperation(type, status, message, details = {}) {
    await IntegrationLog.create({
      integrationId: this.integration._id,
      type,
      status,
      message,
      details,
      orgId: this.integration.orgId
    });
  }

  async testConnection() {
    try {
      switch (this.provider) {
        case 'plaid':
          await axios.post('https://production.plaid.com/accounts/get', {
            client_id: this.credentials.clientId,
            secret: this.credentials.secretKey,
            access_token: this.credentials.accessToken
          });
          break;
        case 'yodlee':
          await axios.get('https://sandbox.api.yodlee.com/ysl/accounts', {
            headers: {
              'Authorization': `Bearer ${this.credentials.accessToken}`,
              'Api-Version': '1.1'
            }
          });
          break;
        default:
          throw new Error(`Connection test not implemented for ${this.provider}`);
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = BankingService;
