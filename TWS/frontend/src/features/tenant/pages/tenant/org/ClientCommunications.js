import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import tenantApiService from '../../../../../shared/services/tenant/tenant-api.service';
import { useTenantAuth } from '../../../../../app/providers/TenantAuthContext';
import ConfirmDialog from '../../../../../features/projects/components/ConfirmDialog';
import ErrorBoundary from '../../../../../features/projects/components/ErrorBoundary';
import toast from 'react-hot-toast';

const ClientCommunications = () => {
  const { tenantSlug } = useParams();
  const { isAuthenticated, loading: authLoading } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [communications, setCommunications] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingCommunicationId, setDeletingCommunicationId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    onConfirm: null, 
    title: '', 
    message: '' 
  });
  const [stats, setStats] = useState({
    totalCommunications: 0,
    emails: 0,
    calls: 0,
    meetings: 0,
    pendingFollowUps: 0,
    thisWeek: 0,
    thisMonth: 0,
    responseRate: 0
  });
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'email',
    subject: '',
    content: '',
    direction: 'outbound',
    status: 'completed',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 0,
    location: '',
    followUpDate: '',
    attachments: []
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && tenantSlug) {
      fetchCommunications();
      fetchClients();
      calculateStats();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [tenantSlug, isAuthenticated, authLoading]);

  const fetchCommunications = async () => {
    if (!isAuthenticated || !tenantSlug) return;
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await tenantApiService.getClientCommunications(tenantSlug);
      const mockCommunications = [];
      setCommunications(mockCommunications);
      calculateStats();
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('Failed to load communications');
      setCommunications([]);
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
    const total = communications.length;
    const emails = communications.filter(c => c.type === 'email').length;
    const calls = communications.filter(c => c.type === 'call').length;
    const meetings = communications.filter(c => c.type === 'meeting').length;
    const pendingFollowUps = communications.filter(c => c.status === 'pending' || c.followUpDate).length;
    
    setStats({
      totalCommunications: total,
      emails,
      calls,
      meetings,
      pendingFollowUps,
      thisWeek: 0,
      thisMonth: 0,
      responseRate: 0
    });
  };

  const handleEditCommunication = (comm) => {
    setSelectedCommunication(comm);
    const commDate = comm.date ? new Date(comm.date) : new Date();
    setFormData({
      clientId: comm.clientId || '',
      type: comm.type || 'email',
      subject: comm.subject || '',
      content: comm.content || '',
      direction: comm.direction || 'outbound',
      status: comm.status || 'completed',
      priority: comm.priority || 'medium',
      date: commDate.toISOString().split('T')[0],
      time: commDate.toTimeString().slice(0, 5),
      duration: comm.duration || 0,
      location: comm.location || '',
      followUpDate: comm.followUpDate || '',
      attachments: comm.attachments || []
    });
    setIsCommunicationModalOpen(true);
  };

  const handleDeleteCommunication = (commId) => {
    const comm = communications.find(c => c._id === commId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Communication',
      message: `Are you sure you want to delete this communication log? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setDeletingCommunicationId(commId);
          // TODO: Replace with actual API call when backend is ready
          // await tenantApiService.deleteClientCommunication(tenantSlug, commId);
          toast.success('Communication deleted successfully');
          fetchCommunications();
        } catch (error) {
          console.error('Error deleting communication:', error);
          toast.error(error.message || 'Failed to delete communication');
        } finally {
          setDeletingCommunicationId(null);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const commData = {
        ...formData,
        date: dateTime.toISOString()
      };
      
      if (selectedCommunication) {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.updateClientCommunication(tenantSlug, selectedCommunication._id, commData);
        toast.success('Communication updated successfully');
      } else {
        // TODO: Replace with actual API call when backend is ready
        // await tenantApiService.createClientCommunication(tenantSlug, commData);
        toast.success('Communication logged successfully');
      }
      setIsCommunicationModalOpen(false);
      setSelectedCommunication(null);
      resetForm();
      fetchCommunications();
    } catch (error) {
      console.error('Error saving communication:', error);
      toast.error(error.message || 'Failed to save communication');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      type: 'email',
      subject: '',
      content: '',
      direction: 'outbound',
      status: 'completed',
      priority: 'medium',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      duration: 0,
      location: '',
      followUpDate: '',
      attachments: []
    });
    setSelectedCommunication(null);
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = 
      (comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (comm.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (comm.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesType = typeFilter === 'all' || comm.type === typeFilter;
    const matchesClient = clientFilter === 'all' || comm.clientId === clientFilter;
    
    return matchesSearch && matchesType && matchesClient;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return EnvelopeIcon;
      case 'call': return PhoneIcon;
      case 'meeting': return VideoCameraIcon;
      default: return ChatBubbleLeftRightIcon;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'call': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getDirectionColor = (direction) => {
    return direction === 'inbound' 
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary message="Failed to load communications. Please refresh the page.">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="glass-card-premium p-8 text-center wolfstack-animate-fadeIn">
          <h1 className="text-4xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-4">
            Communication Logs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track all client communications including emails, calls, and meetings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCommunications}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Total</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">All communications</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <EnvelopeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.emails}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Emails</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email communications</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <PhoneIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.calls}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Calls</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Phone calls</p>
          </div>

          <div className="glass-card p-6 hover-scale group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                <VideoCameraIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.meetings}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meetings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Meetings & video calls</p>
          </div>
        </div>

        {/* Communications Management Section */}
        <div className="glass-card-premium p-8 wolfstack-animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-tight mb-2">
                Communication History
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCommunications.length} {filteredCommunications.length === 1 ? 'communication' : 'communications'} found
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsCommunicationModalOpen(true);
              }}
              className="wolfstack-button-primary w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Log Communication
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
                    placeholder="Search communications by subject, content, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3"
                  />
                </div>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="glass-input px-4 py-3 min-w-[180px]"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
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

          {/* Communications List */}
          {filteredCommunications.length > 0 ? (
            <div className="space-y-4">
              {filteredCommunications.map((comm) => {
                const TypeIcon = getTypeIcon(comm.type);
                const commDate = comm.date ? new Date(comm.date) : new Date();
                return (
                  <div key={comm._id} className="glass-card p-6 hover-scale group wolfstack-animate-fadeIn">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getTypeColor(comm.type).split(' ')[0]}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {comm.subject}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ${getTypeColor(comm.type)}`}>
                              {comm.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ${getDirectionColor(comm.direction)}`}>
                              {comm.direction}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              <span className="truncate">{comm.clientName}</span>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{commDate.toLocaleDateString()}</span>
                            </div>
                            {comm.duration > 0 && (
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                <span>{comm.duration} min</span>
                              </div>
                            )}
                          </div>
                          {comm.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {comm.content}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => {
                            setSelectedCommunication(comm);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCommunication(comm)}
                          className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit communication"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCommunication(comm._id)}
                          disabled={deletingCommunicationId === comm._id}
                          className="p-2 glass-button hover-scale text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete communication"
                        >
                          {deletingCommunicationId === comm._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card-premium p-16 text-center wolfstack-animate-fadeIn">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-4">
                No communications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || typeFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by logging your first client communication.'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && clientFilter === 'all' && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsCommunicationModalOpen(true);
                  }}
                  className="wolfstack-button-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Log Your First Communication
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Communication Modal */}
        {isCommunicationModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 wolfstack-animate-fadeIn">
            <div className="glass-card-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {selectedCommunication ? 'Edit Communication' : 'Log New Communication'}
                </h3>
                <button
                  onClick={() => {
                    setIsCommunicationModalOpen(false);
                    setSelectedCommunication(null);
                    resetForm();
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        Communication Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="glass-input w-full"
                      >
                        <option value="email">Email</option>
                        <option value="call">Call</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Direction *
                      </label>
                      <select
                        required
                        value={formData.direction}
                        onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                        className="glass-input w-full"
                      >
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
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
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="glass-input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="glass-input w-full"
                      />
                    </div>

                    {formData.type === 'call' || formData.type === 'meeting' ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                          className="glass-input w-full"
                          placeholder="0"
                        />
                      </div>
                    ) : null}

                    {formData.type === 'meeting' ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="glass-input w-full"
                          placeholder="Meeting location or video link"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="glass-input w-full"
                      placeholder="Communication subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Content/Notes *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="glass-input w-full resize-none"
                      placeholder="Enter communication details, notes, or summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Follow-up Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200/50 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCommunicationModalOpen(false);
                      setSelectedCommunication(null);
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
                    {selectedCommunication ? 'Update Communication' : 'Log Communication'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Communication Details Modal */}
        {showDetailsModal && selectedCommunication && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto wolfstack-animate-scaleIn">
              <div className="sticky top-0 glass-card border-b border-gray-200/50 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-xl z-10">
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  Communication Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCommunication(null);
                  }}
                  className="p-2 glass-button hover-scale text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{selectedCommunication.subject}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedCommunication.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(selectedCommunication.type)}`}>
                          {selectedCommunication.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Direction</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getDirectionColor(selectedCommunication.direction)}`}>
                          {selectedCommunication.direction}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {selectedCommunication.date ? new Date(selectedCommunication.date).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedCommunication.content && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Content</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedCommunication.content}</p>
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

export default ClientCommunications;
