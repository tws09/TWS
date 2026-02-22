/**
 * Finance Real-time Service
 * Broadcasts finance updates via WebSocket
 */
class FinanceRealtimeService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Broadcast KPI updates
   */
  broadcastKPIUpdate(orgId, kpis) {
    if (this.io) {
      this.io.broadcastToFinance(orgId, 'finance:data-updated', {
        type: 'kpis',
        data: kpis,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast transaction update
   */
  broadcastTransactionUpdate(orgId, transaction) {
    if (this.io) {
      this.io.broadcastToFinance(orgId, 'finance:data-updated', {
        type: 'transaction',
        data: transaction,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast invoice update
   */
  broadcastInvoiceUpdate(orgId, invoice) {
    if (this.io) {
      this.io.broadcastToFinance(orgId, 'finance:data-updated', {
        type: 'invoice',
        data: invoice,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast bill update
   */
  broadcastBillUpdate(orgId, bill) {
    if (this.io) {
      this.io.broadcastToFinance(orgId, 'finance:data-updated', {
        type: 'bill',
        data: bill,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast financial alert
   */
  broadcastAlert(orgId, alert) {
    if (this.io) {
      this.io.broadcastToFinance(orgId, 'finance:alert', {
        ...alert,
        timestamp: new Date()
      });
    }
  }
}

module.exports = FinanceRealtimeService;

