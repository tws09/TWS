import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { tenantApiService } from '../../../../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../../../../app/providers/TenantAuthContext';

const BankingManagement = () => {
  const { tenantSlug } = useParams();
  const { isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    accounts: 0,
    transactions: 0,
    pendingReconciliation: 0
  });

  useEffect(() => {
    // Only fetch data if authenticated and auth is not loading
    if (isAuthenticated && !authLoading && tenantSlug) {
      fetchBankingData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [tenantSlug, isAuthenticated, authLoading]);

  const fetchBankingData = async () => {
    // Don't make API calls if not authenticated
    if (!isAuthenticated || !tenantSlug) {
      return;
    }

    try {
      setLoading(true);
      const data = await tenantApiService.getBankingData(tenantSlug);
      setBankAccounts(data.accounts || []);
      setStats({
        totalBalance: data.totalBalance || 0,
        accounts: data.accounts?.length || 0,
        transactions: data.transactions || 0,
        pendingReconciliation: data.pendingReconciliation || 0
      });
    } catch (err) {
      console.error('Error fetching banking data:', err);
      // Set default empty data if API fails (backend route not implemented yet)
      setBankAccounts([]);
      setStats({
        totalBalance: 0,
        accounts: 0,
        transactions: 0,
        pendingReconciliation: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcileAccount = async (accountId, transactions) => {
    try {
      await tenantApiService.reconcileBankAccount(tenantSlug, accountId, transactions);
      alert('Account reconciled successfully!');
      fetchBankingData();
    } catch (error) {
      console.error('Error reconciling account:', error);
      alert(error.message || 'Failed to reconcile account. Please try again.');
    }
  };

  const handleImportStatement = async (accountId, file, format = 'csv') => {
    try {
      await tenantApiService.importBankStatement(tenantSlug, accountId, file, format);
      alert('Bank statement imported successfully!');
      fetchBankingData();
    } catch (error) {
      console.error('Error importing statement:', error);
      alert(error.message || 'Failed to import bank statement. Please try again.');
    }
  };

  const handleTransferFunds = async (fromAccountId, toAccountId, amount, description) => {
    try {
      await tenantApiService.transferFunds(tenantSlug, fromAccountId, toAccountId, amount, description);
      alert('Funds transferred successfully!');
      fetchBankingData();
    } catch (error) {
      console.error('Error transferring funds:', error);
      alert(error.message || 'Failed to transfer funds. Please try again.');
    }
  };

  const statsData = [
    { label: 'Total Balance', value: `$${stats.totalBalance.toLocaleString()}`, icon: BanknotesIcon, iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { label: 'Bank Accounts', value: stats.accounts.toString(), icon: BuildingOfficeIcon, iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Transactions', value: stats.transactions.toString(), icon: ChartBarIcon, iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { label: 'Pending Reconciliation', value: stats.pendingReconciliation.toString(), icon: ArrowDownTrayIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading banking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Banking Management
          </h1>
          <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage bank accounts and transactions
          </p>
        </div>
        <button className="glass-button px-4 py-2 rounded-xl hover-scale flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Add Account</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="glass-card-premium p-5 xl:p-6 hover-lift">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-glow-lg`}>
                <stat.icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl xl:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Accounts */}
      <div className="glass-card-premium p-6 xl:p-8 hover-glow">
        <h3 className="text-lg xl:text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">
          Bank Accounts ({bankAccounts.length})
        </h3>
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Banking management interface</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Detailed bank account and reconciliation features coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default BankingManagement;