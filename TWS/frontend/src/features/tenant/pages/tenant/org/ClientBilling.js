import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CurrencyDollarIcon,
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
  ChartBarIcon,
  PrinterIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import tenantApiService from '../../../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../../../app/providers/TenantAuthContext';
import ConfirmDialog from '../../../../../features/projects/components/ConfirmDialog';
import ErrorBoundary from '../../../../../features/projects/components/ErrorBoundary';
import toast from 'react-hot-toast';

const ClientBilling = () => {
  const { tenantSlug } = useParams();
  const { isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    onConfirm: null, 
    title: '', 
    message: '' 
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    paidAmount: 0,
    totalInvoices: 0,
    overdueInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  });
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
    discount: 0,
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && tenantSlug) {
      fetchInvoices();
      fetchClients();
      calculateStats();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [tenantSlug, isAuthenticated, authLoading]);

  const fetchInvoices = async () => {
    if (!isAuthenticated || !tenantSlug) return;
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await tenantApiService.getClientInvoices(tenantSlug);
      const mockInvoices = [];
      setInvoices(mockInvoices);
      calculateStats();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
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
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const pending = invoices.filter(i => i.status === 'pending').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const totalRevenue = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.total || 0), 0);
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0);

    setStats({
      totalRevenue,
      pendingAmount,
      overdueAmount,
      paidAmount,
      totalInvoices: total,
      overdueInvoices: overdue,
      pendingInvoices: pending,
      paidInvoices: paid
    });
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber || '',
      clientId: invoice.clientId || '',
      description: invoice.description || '',
      issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      status: invoice.status || 'draft',
      items: invoice.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      notes: invoice.notes || ''
    });
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = (invoiceId) => {
    const invoice = invoices.find(i => i._id === invoiceId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice ${invoice?.invoiceNumber || invoiceId}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setDeletingInvoiceId(invoiceId);
          // TODO: Replace with actual API call when backend is ready
          // await tenantApiService.deleteClientInvoice(tenantSlug, invoiceId);
          toast.success('Invoice deleted successfully');
          fetchInvoices();
        } catch (error) {
          console.error('Error deleting invoice:', error);
          toast.error(error.message || 'Failed to delete invoice');
        } finally {
          setDeletingInvoiceId(null);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const discountAmount = (subtotal * formData.discount) / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const taxAmount = (subtotalAfterDiscount * formData.tax) / 100;
      const total = subtotalAfterDiscount + taxAmount;

      const invoiceData = {
        ...formData,
        subtotal,
        total,
        taxAmount,
        discountAmount
      };

      if (selectedInvoice) {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.updateClientInvoice(tenantSlug, selectedInvoice._id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.createClientInvoice(tenantSlug, invoiceData);
        toast.success('Invoice created successfully');
      }
      setIsInvoiceModalOpen(false);
      setSelectedInvoice(null);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error.message || 'Failed to save invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      clientId: '',
      description: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
      discount: 0,
      notes: ''
    });
    setSelectedInvoice(null);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (newItems[index].quantity || 0) * (newItems[index].rate || 0);
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      (invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesClient = clientFilter === 'all' || invoice.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'paid') return false;
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary message="Failed to load billing. Please refresh the page.">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="glass-card-premium p-8 text-center wolfstack-animate-fadeIn">
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
            Client Billing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage client invoices, track payments, and monitor billing cycles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(stats.totalRevenue / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Revenue</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">All invoices</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${(stats.paidAmount / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Paid</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.paidInvoices} invoices</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ${(stats.pendingAmount / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Pending</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingInvoices} invoices</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${(stats.overdueAmount / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Overdue</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.overdueInvoices} invoices</p>
          </div>
        </div>

        {/* Invoices Management Section */}
        <div className="glass-card-premium p-8 wolfstack-animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-2">
                All Invoices
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} found
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsInvoiceModalOpen(true);
              }}
              className="wolfstack-button-primary w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Invoice
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
                    placeholder="Search invoices by number, description, or client..."
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
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
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

          {/* Invoices Grid */}
          {filteredInvoices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvoices.map((invoice) => (
                <div key={invoice._id} className="glass-card p-6 hover-scale group wolfstack-animate-fadeIn">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {invoice.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit invoice"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice._id)}
                        disabled={deletingInvoiceId === invoice._id}
                        className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete invoice"
                      >
                        {deletingInvoiceId === invoice._id ? (
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
                      <span className="truncate">{invoice.clientName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" />
                      <span className="font-bold text-lg text-gray-900 dark:text-white">${invoice.total?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500" />
                      <span>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                      {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Draft'}
                    </span>
                    {isOverdue(invoice.dueDate, invoice.status) && (
                      <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card-premium p-16 text-center wolfstack-animate-fadeIn">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
                <DocumentTextIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-4">
                No invoices found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first invoice to manage client billing efficiently.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && clientFilter === 'all' && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsInvoiceModalOpen(true);
                  }}
                  className="wolfstack-button-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Invoice
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Invoice Modal */}
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 wolfstack-animate-fadeIn">
            <div className="glass-card-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <button
                  onClick={() => {
                    setIsInvoiceModalOpen(false);
                    setSelectedInvoice(null);
                    resetForm();
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      Invoice Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Invoice Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.invoiceNumber}
                          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                          className="glass-input w-full"
                          placeholder="INV-2024-001"
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Issue Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.issueDate}
                          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                          className="glass-input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="glass-input w-full"
                        />
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
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="glass-input w-full"
                        placeholder="Invoice description"
                      />
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Invoice Items
                      </h4>
                      <button
                        type="button"
                        onClick={addItem}
                        className="wolfstack-button-secondary text-sm"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.items.map((item, index) => (
                        <div key={index} className="glass-card p-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-5">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                className="glass-input w-full text-sm"
                                placeholder="Item description"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Qty
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="glass-input w-full text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Rate
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                className="glass-input w-full text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Amount
                              </label>
                              <input
                                type="text"
                                value={`$${item.amount.toFixed(2)}`}
                                readOnly
                                className="glass-input w-full text-sm bg-gray-50 dark:bg-gray-800"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                disabled={formData.items.length === 1}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 glass-card p-4">
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Subtotal:</span>
                            <span className="font-semibold">${formData.items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Discount ({formData.discount}%):</span>
                            <span className="font-semibold">-${((formData.items.reduce((sum, item) => sum + (item.amount || 0), 0) * formData.discount) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Tax ({formData.tax}%):</span>
                            <span className="font-semibold">${(((formData.items.reduce((sum, item) => sum + (item.amount || 0), 0) * (100 - formData.discount) / 100) * formData.tax) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Total:</span>
                            <span>${(((formData.items.reduce((sum, item) => sum + (item.amount || 0), 0) * (100 - formData.discount) / 100) * (100 + formData.tax) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                          className="glass-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Tax (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.tax}
                          onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                          className="glass-input w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="glass-input w-full resize-none"
                      placeholder="Additional notes or terms..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200/50 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInvoiceModalOpen(false);
                      setSelectedInvoice(null);
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
                    {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Details Modal */}
        {showDetailsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-premium max-w-4xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  Invoice Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{selectedInvoice.invoiceNumber}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedInvoice.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          ${selectedInvoice.total?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(selectedInvoice.status)}`}>
                          {selectedInvoice.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedInvoice.description && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.description}</p>
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

export default ClientBilling;
