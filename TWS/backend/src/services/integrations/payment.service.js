/**
 * Payment Service
 * Handles payment processing and billing
 */

class PaymentService {
  constructor() {
    this.initialized = false;
    this.transactions = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('💳 Payment Service initialized');
    this.initialized = true;
  }

  /**
   * Process payment
   */
  async processPayment(paymentData) {
    if (!this.initialized) throw new Error('Payment service not initialized');

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...paymentData
    };

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    transaction.status = isSuccess ? 'completed' : 'failed';
    transaction.processedAt = new Date().toISOString();

    if (!isSuccess) {
      transaction.error = 'Payment declined by bank';
    }

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId) {
    if (!this.initialized) return null;
    return this.transactions.get(transactionId) || null;
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId) {
    if (!this.initialized) return [];
    
    return Array.from(this.transactions.values())
      .filter(txn => txn.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId, amount = null) {
    if (!this.initialized) throw new Error('Payment service not initialized');

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Cannot refund non-completed transaction');
    }

    const refundAmount = amount || transaction.amount;
    const refund = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalTransactionId: transactionId,
      amount: refundAmount,
      currency: transaction.currency,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    transaction.refunded = true;
    transaction.refundAmount = refundAmount;
    transaction.refundId = refund.id;

    return refund;
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.initialized;
  }

  /**
   * Get service metrics
   */
  async getMetrics() {
    const transactions = Array.from(this.transactions.values());
    const completed = transactions.filter(txn => txn.status === 'completed').length;
    const failed = transactions.filter(txn => txn.status === 'failed').length;

    return {
      status: 'active',
      initialized: this.initialized,
      totalTransactions: transactions.length,
      completedTransactions: completed,
      failedTransactions: failed,
      successRate: transactions.length > 0 ? (completed / transactions.length * 100).toFixed(2) : 0
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    this.transactions.clear();
    this.initialized = false;
    console.log('💳 Payment Service shut down');
  }
}

module.exports = new PaymentService();
