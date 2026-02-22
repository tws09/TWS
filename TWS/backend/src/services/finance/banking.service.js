const { BankAccount, Transaction, JournalEntry, ChartOfAccounts } = require('../../models/Finance');
const csv = require('csv-parser');
const fs = require('fs');

class BankingService {
  /**
   * Reconcile bank account
   * @param {string} orgId - Organization ID
   * @param {string} accountId - Bank account ID
   * @param {Array} transactions - Bank statement transactions
   * @returns {Object} Reconciliation result
   */
  async reconcileAccount(orgId, accountId, transactions) {
    try {
      const bankAccount = await BankAccount.findOne({ _id: accountId, orgId: orgId });
      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      // Get all unreconciled transactions for this account
      const unreconciledTransactions = await Transaction.find({
        orgId: orgId,
        'bankReconciliation.reconciled': false,
        accountId: bankAccount.accountId // Chart of Accounts ID
      }).sort({ date: 1 });

      const matched = [];
      const unmatched = [];
      const discrepancies = [];

      // Match transactions
      transactions.forEach(bankTx => {
        const match = unreconciledTransactions.find(tx => {
          // Match by amount and date (within 2 days)
          const amountMatch = Math.abs(tx.amount - bankTx.amount) < 0.01;
          const dateMatch = Math.abs(
            (new Date(tx.date) - new Date(bankTx.date)) / (1000 * 60 * 60 * 24)
          ) <= 2;

          return amountMatch && dateMatch;
        });

        if (match) {
          matched.push({
            transactionId: match._id,
            bankTransaction: bankTx,
            systemTransaction: match
          });

          // Mark as reconciled
          match.bankReconciliation.reconciled = true;
          match.bankReconciliation.reconciledAt = new Date();
          match.bankReconciliation.bankTransactionId = bankTx.id || bankTx.reference;
          match.save();
        } else {
          unmatched.push(bankTx);
        }
      });

      // Find system transactions not in bank statement
      unreconciledTransactions.forEach(tx => {
        const found = matched.find(m => m.transactionId.toString() === tx._id.toString());
        if (!found) {
          discrepancies.push({
            transactionId: tx._id,
            transaction: tx,
            type: 'system_only',
            message: 'Transaction exists in system but not in bank statement'
          });
        }
      });

      // Update bank account balance
      const statementBalance = transactions[transactions.length - 1]?.balance || bankAccount.balance;
      bankAccount.lastReconciledAt = new Date();
      bankAccount.balance = statementBalance;
      await bankAccount.save();

      return {
        accountId: accountId,
        accountName: bankAccount.name,
        reconciliationDate: new Date(),
        matched: matched.length,
        unmatched: unmatched.length,
        discrepancies: discrepancies.length,
        statementBalance: statementBalance,
        systemBalance: bankAccount.balance,
        details: {
          matched: matched,
          unmatched: unmatched,
          discrepancies: discrepancies
        }
      };
    } catch (error) {
      console.error('Error reconciling account:', error);
      throw error;
    }
  }

  /**
   * Import bank statement
   * @param {string} orgId - Organization ID
   * @param {string} accountId - Bank account ID
   * @param {string} statementFile - File path or buffer
   * @param {string} format - File format (csv, qif, ofx)
   * @returns {Object} Import result
   */
  async importBankStatement(orgId, accountId, statementFile, format = 'csv') {
    try {
      const bankAccount = await BankAccount.findOne({ _id: accountId, orgId: orgId });
      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      const transactions = [];
      
      if (format === 'csv') {
        // Parse CSV file
        const results = await this.parseCSV(statementFile);
        
        results.forEach(row => {
          transactions.push({
            date: new Date(row.date || row.Date || row['Transaction Date']),
            description: row.description || row.Description || row['Transaction Description'],
            amount: parseFloat(row.amount || row.Amount || row['Transaction Amount'] || 0),
            reference: row.reference || row.Reference || row['Reference Number'],
            balance: parseFloat(row.balance || row.Balance || 0),
            type: row.type || row.Type || (parseFloat(row.amount || row.Amount) >= 0 ? 'credit' : 'debit')
          });
        });
      } else if (format === 'qif') {
        // Parse QIF file (simplified)
        transactions.push(...this.parseQIF(statementFile));
      } else if (format === 'ofx') {
        // Parse OFX file (simplified)
        transactions.push(...this.parseOFX(statementFile));
      }

      // Create transaction records
      const createdTransactions = [];
      const cashAccount = await ChartOfAccounts.findOne({
        orgId: orgId,
        type: 'asset',
        code: { $regex: /^1/ },
        name: { $regex: /cash/i }
      });

      for (const tx of transactions) {
        // Check if transaction already exists
        const existing = await Transaction.findOne({
          orgId: orgId,
          amount: tx.amount,
          date: tx.date,
          description: { $regex: new RegExp(tx.description.substring(0, 20), 'i') }
        });

        if (!existing) {
          const transaction = new Transaction({
            orgId: orgId,
            type: tx.type === 'credit' ? 'revenue' : 'expense',
            category: 'banking',
            amount: Math.abs(tx.amount),
            currency: bankAccount.currency || 'USD',
            date: tx.date,
            description: `Bank import: ${tx.description}`,
            reference: tx.reference,
            accountId: cashAccount?._id,
            bankReconciliation: {
              reconciled: false,
              bankTransactionId: tx.reference
            }
          });

          await transaction.save();
          createdTransactions.push(transaction);
        }
      }

      return {
        accountId: accountId,
        imported: createdTransactions.length,
        skipped: transactions.length - createdTransactions.length,
        transactions: createdTransactions
      };
    } catch (error) {
      console.error('Error importing bank statement:', error);
      throw error;
    }
  }

  /**
   * Transfer funds between accounts
   * @param {string} orgId - Organization ID
   * @param {string} fromAccountId - Source account ID
   * @param {string} toAccountId - Destination account ID
   * @param {number} amount - Transfer amount
   * @param {string} description - Transfer description
   * @returns {Object} Transfer result
   */
  async transferFunds(orgId, fromAccountId, toAccountId, amount, description = '') {
    try {
      const fromAccount = await BankAccount.findOne({ _id: fromAccountId, orgId: orgId });
      const toAccount = await BankAccount.findOne({ _id: toAccountId, orgId: orgId });

      if (!fromAccount || !toAccount) {
        throw new Error('One or both bank accounts not found');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds in source account');
      }

      // Get chart of accounts
      const fromChartAccount = await ChartOfAccounts.findById(fromAccount.accountId);
      const toChartAccount = await ChartOfAccounts.findById(toAccount.accountId);

      if (!fromChartAccount || !toChartAccount) {
        throw new Error('Chart of accounts not found for bank accounts');
      }

      // Create journal entry for transfer
      const entryNumber = await this.generateEntryNumber(orgId);
      
      const journalEntry = new JournalEntry({
        orgId: orgId,
        entryNumber: entryNumber,
        date: new Date(),
        description: description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
        reference: `TRF-${Date.now()}`,
        entries: [
          {
            accountId: toChartAccount._id,
            debit: amount,
            credit: 0,
            description: `Transfer from ${fromAccount.name}`
          },
          {
            accountId: fromChartAccount._id,
            debit: 0,
            credit: amount,
            description: `Transfer to ${toAccount.name}`
          }
        ],
        totalDebit: amount,
        totalCredit: amount,
        status: 'posted',
        postedAt: new Date()
      });

      await journalEntry.save();

      // Update bank account balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      await fromAccount.save();
      await toAccount.save();

      // Create transaction records
      const fromTransaction = new Transaction({
        orgId: orgId,
        type: 'transfer',
        category: 'banking',
        amount: amount,
        currency: fromAccount.currency || 'USD',
        date: new Date(),
        description: `Transfer to ${toAccount.name}`,
        accountId: fromChartAccount._id,
        bankReconciliation: {
          reconciled: true,
          reconciledAt: new Date()
        }
      });

      const toTransaction = new Transaction({
        orgId: orgId,
        type: 'transfer',
        category: 'banking',
        amount: amount,
        currency: toAccount.currency || 'USD',
        date: new Date(),
        description: `Transfer from ${fromAccount.name}`,
        accountId: toChartAccount._id,
        bankReconciliation: {
          reconciled: true,
          reconciledAt: new Date()
        }
      });

      await fromTransaction.save();
      await toTransaction.save();

      return {
        success: true,
        transferId: journalEntry._id,
        fromAccount: {
          id: fromAccount._id,
          name: fromAccount.name,
          newBalance: fromAccount.balance
        },
        toAccount: {
          id: toAccount._id,
          name: toAccount.name,
          newBalance: toAccount.balance
        },
        amount: amount,
        journalEntry: journalEntry._id
      };
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }

  /**
   * Parse CSV file
   * @param {string|Buffer} file - File path or buffer
   * @returns {Promise<Array>} Parsed transactions
   */
  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = typeof file === 'string' ? fs.createReadStream(file) : file;

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Parse QIF file (simplified)
   * @param {string|Buffer} file - File content
   * @returns {Array} Parsed transactions
   */
  parseQIF(file) {
    // Simplified QIF parser - would need full implementation
    const transactions = [];
    const lines = typeof file === 'string' ? file.split('\n') : file.toString().split('\n');
    
    let currentTx = {};
    lines.forEach(line => {
      if (line.startsWith('D')) {
        currentTx.date = new Date(line.substring(1));
      } else if (line.startsWith('T')) {
        currentTx.amount = parseFloat(line.substring(1));
      } else if (line.startsWith('P')) {
        currentTx.description = line.substring(1);
      } else if (line.startsWith('^')) {
        if (currentTx.date && currentTx.amount !== undefined) {
          transactions.push(currentTx);
        }
        currentTx = {};
      }
    });

    return transactions;
  }

  /**
   * Parse OFX file (simplified)
   * @param {string|Buffer} file - File content
   * @returns {Array} Parsed transactions
   */
  parseOFX(file) {
    // Simplified OFX parser - would need full implementation
    const transactions = [];
    const content = typeof file === 'string' ? file : file.toString();
    
    // Basic regex parsing (simplified)
    const txMatches = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
    if (txMatches) {
      txMatches.forEach(match => {
        const dateMatch = match.match(/<DTPOSTED>(\d+)/);
        const amountMatch = match.match(/<TRNAMT>([-\d.]+)/);
        const descMatch = match.match(/<MEMO>(.*?)<\/MEMO>/);

        if (dateMatch && amountMatch) {
          transactions.push({
            date: new Date(dateMatch[1]),
            amount: parseFloat(amountMatch[1]),
            description: descMatch ? descMatch[1] : ''
          });
        }
      });
    }

    return transactions;
  }

  /**
   * Generate journal entry number
   * @param {string} orgId - Organization ID
   * @returns {string} Entry number
   */
  async generateEntryNumber(orgId) {
    try {
      const year = new Date().getFullYear();
      const prefix = `JE-${year}-`;

      const lastEntry = await JournalEntry.findOne({
        orgId: orgId,
        entryNumber: { $regex: `^${prefix}` }
      }).sort({ entryNumber: -1 });

      let sequence = 1;
      if (lastEntry && lastEntry.entryNumber) {
        const lastSequence = parseInt(lastEntry.entryNumber.split('-').pop()) || 0;
        sequence = lastSequence + 1;
      }

      return `${prefix}${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      return `JE-${Date.now()}`;
    }
  }
}

module.exports = new BankingService();
