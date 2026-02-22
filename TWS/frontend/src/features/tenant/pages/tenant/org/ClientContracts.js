import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DocumentCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  BuildingOfficeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import tenantApiService from '../../../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../../../app/providers/TenantAuthContext';
import ConfirmDialog from '../../../../../features/projects/components/ConfirmDialog';
import ErrorBoundary from '../../../../../features/projects/components/ErrorBoundary';
import toast from 'react-hot-toast';

const ClientContracts = () => {
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingContractId, setDeletingContractId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    onConfirm: null, 
    title: '', 
    message: '' 
  });
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    expiredContracts: 0,
    pendingContracts: 0,
    totalValue: 0,
    expiringSoon: 0,
    thisMonth: 0,
    renewalRate: 0
  });
  const [formData, setFormData] = useState({
    contractNumber: '',
    clientId: '',
    title: '',
    type: 'development',
    status: 'draft',
    startDate: '',
    endDate: '',
    value: 0,
    currency: 'USD',
    paymentTerms: 'monthly',
    description: '',
    terms: [],
    milestones: []
  });
  const [termInput, setTermInput] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && tenantSlug) {
      fetchContracts();
      fetchClients();
      calculateStats();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [tenantSlug, isAuthenticated, authLoading]);

  const fetchContracts = async () => {
    if (!isAuthenticated || !tenantSlug) return;
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await tenantApiService.getContracts(tenantSlug);
      // Mock data for now
      const mockContracts = [];
      setContracts(mockContracts);
      calculateStats();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    if (!isAuthenticated || !tenantSlug) return;
    try {
      const response = await tenantApiService.getClients(tenantSlug);
      let clientsArray = [];
      if (response?.success && response.data) {
        if (Array.isArray(response.data)) {
          clientsArray = response.data;
        } else if (Array.isArray(response.data.clients)) {
          clientsArray = response.data.clients;
        }
      }
      setClients(clientsArray);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const calculateStats = () => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const expired = contracts.filter(c => c.status === 'expired').length;
    const pending = contracts.filter(c => c.status === 'pending').length;
    const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
    const now = new Date();
    const expiringSoon = contracts.filter(c => {
      if (c.status !== 'active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;

    setStats({
      totalContracts: total,
      activeContracts: active,
      expiredContracts: expired,
      pendingContracts: pending,
      totalValue,
      expiringSoon,
      thisMonth: 0,
      renewalRate: 0
    });
  };

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setFormData({
      contractNumber: contract.contractNumber || '',
      clientId: contract.clientId || '',
      title: contract.title || '',
      type: contract.type || 'development',
      status: contract.status || 'draft',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      value: contract.value || 0,
      currency: contract.currency || 'USD',
      paymentTerms: contract.paymentTerms || 'monthly',
      description: contract.description || '',
      terms: contract.terms || [],
      milestones: contract.milestones || []
    });
    setIsContractModalOpen(true);
  };

  const handleDeleteContract = (contractId) => {
    const contract = contracts.find(c => c._id === contractId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Contract',
      message: `Are you sure you want to delete contract ${contract?.contractNumber || contractId}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setDeletingContractId(contractId);
          // TODO: Replace with actual API call when backend is ready
          // await tenantApiService.deleteContract(tenantSlug, contractId);
          toast.success('Contract deleted successfully');
          fetchContracts();
        } catch (error) {
          console.error('Error deleting contract:', error);
          toast.error(error.message || 'Failed to delete contract');
        } finally {
          setDeletingContractId(null);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContract) {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.updateContract(tenantSlug, selectedContract._id, formData);
        toast.success('Contract updated successfully');
      } else {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.createContract(tenantSlug, formData);
        toast.success('Contract created successfully');
      }
      setIsContractModalOpen(false);
      setSelectedContract(null);
      resetForm();
      fetchContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error(error.message || 'Failed to save contract');
    }
  };

  const resetForm = () => {
    setFormData({
      contractNumber: '',
      clientId: '',
      title: '',
      type: 'development',
      status: 'draft',
      startDate: '',
      endDate: '',
      value: 0,
      currency: 'USD',
      paymentTerms: 'monthly',
      description: '',
      terms: [],
      milestones: []
    });
    setTermInput('');
    setSelectedContract(null);
  };

  const addTerm = () => {
    if (termInput.trim()) {
      setFormData({
        ...formData,
        terms: [...formData.terms, termInput.trim()]
      });
      setTermInput('');
    }
  };

  const removeTerm = (index) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== index)
    });
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      (contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesClient = clientFilter === 'all' || contract.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary message="Failed to load contracts. Please refresh the page.">
      <div className="space-y-8">
        {/* Header Section - Premium Wolfstack Style */}
        <div className="glass-card-premium p-8 text-center wolfstack-animate-fadeIn">
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
            Client Contracts
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage client contracts, track agreements, and monitor contract lifecycle
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <DocumentCheckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalContracts}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Contracts</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">All contracts</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.activeContracts}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Active</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently active</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.expiringSoon}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiring Soon</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Within 30 days</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${(stats.totalValue / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Value</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Contract value</p>
          </div>
        </div>

        {/* Contracts Management Section */}
        <div className="glass-card-premium p-8 wolfstack-animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-2">
                All Contracts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredContracts.length} {filteredContracts.length === 1 ? 'contract' : 'contracts'} found
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsContractModalOpen(true);
              }}
              className="wolfstack-button-primary w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Contract
            </button>
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search contracts by number, title, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-input px-4 py-3 min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="glass-input px-4 py-3 min-w-[180px]"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contracts Grid */}
          {filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts.map((contract) => (
                <div key={contract._id} className="glass-card p-6 hover-scale group wolfstack-animate-fadeIn">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <DocumentCheckIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {contract.contractNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {contract.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditContract(contract)}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit contract"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContract(contract._id)}
                        disabled={deletingContractId === contract._id}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete contract"
                      >
                        {deletingContractId === contract._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" />
                      <span className="truncate">{contract.clientName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" />
                      <span className="font-semibold">${contract.value?.toLocaleString() || '0'}</span>
                      <span className="ml-1 text-gray-500">({contract.paymentTerms})</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" />
                      <span>Ends: {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(contract.status)}`}>
                      {contract.status?.charAt(0).toUpperCase() + contract.status?.slice(1) || 'Draft'}
                    </span>
                    {isExpiringSoon(contract.endDate) && contract.status === 'active' && (
                      <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        <span>Expiring Soon</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card-premium p-16 text-center wolfstack-animate-fadeIn">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
                <DocumentCheckIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-4">
                No contracts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first contract to manage client agreements efficiently.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && clientFilter === 'all' && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsContractModalOpen(true);
                  }}
                  className="wolfstack-button-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Contract
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Contract Modal */}
        {isContractModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 wolfstack-animate-fadeIn">
            <div className="glass-card-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {selectedContract ? 'Edit Contract' : 'Create New Contract'}
                </h3>
                <button
                  onClick={() => {
                    setIsContractModalOpen(false);
                    setSelectedContract(null);
                    resetForm();
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contract Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contractNumber}
                          onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                          className="glass-input w-full"
                          placeholder="CON-2024-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Client *
                        </label>
                        <select
                          required
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                          className="glass-input w-full"
                        >
                          <option value="">Select client</option>
                          {clients.map(client => (
                            <option key={client._id} value={client._id}>{client.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contract Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="glass-input w-full"
                          placeholder="e.g., Website Development Agreement"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contract Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="glass-input w-full"
                        >
                          <option value="development">Development</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="consulting">Consulting</option>
                          <option value="support">Support</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="glass-input w-full"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Financial */}
                  <div>
                    <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      Dates & Financial
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="glass-input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="glass-input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Contract Value *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                          className="glass-input w-full"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Currency
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="glass-input w-full"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Payment Terms
                        </label>
                        <select
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                          className="glass-input w-full"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="milestone">Milestone</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annual">Annual</option>
                          <option value="one-time">One-time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="glass-input w-full resize-none"
                      placeholder="Enter contract description..."
                    />
                  </div>

                  {/* Terms */}
                  <div>
                    <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">
                      Contract Terms
                    </h4>
                    <div className="space-y-2 mb-3">
                      {formData.terms.map((term, index) => (
                        <div key={index} className="flex items-center justify-between glass-card p-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                          <button
                            type="button"
                            onClick={() => removeTerm(index)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={termInput}
                        onChange={(e) => setTermInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTerm();
                          }
                        }}
                        className="glass-input flex-1"
                        placeholder="Add a term and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addTerm}
                        className="wolfstack-button-secondary"
                      >
                        Add Term
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200/50 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContractModalOpen(false);
                      setSelectedContract(null);
                      resetForm();
                    }}
                    className="wolfstack-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="wolfstack-button-primary"
                  >
                    {selectedContract ? 'Update Contract' : 'Create Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contract Details Modal */}
        {showDetailsModal && selectedContract && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  Contract Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedContract(null);
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{selectedContract.title}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contract Number</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedContract.contractNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedContract.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Value</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          ${selectedContract.value?.toLocaleString()} {selectedContract.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(selectedContract.status)}`}>
                          {selectedContract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedContract.description && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedContract.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '' })}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </ErrorBoundary>
  );
};

export default ClientContracts;
