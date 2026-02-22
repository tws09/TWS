import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../app/providers/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  FlagIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ModerationDashboard = () => {
  const { user } = useAuth();
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flagged');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    loadFlaggedMessages();
    loadAuditLogs();
  }, []);

  const loadFlaggedMessages = async () => {
    try {
      const response = await axios.get('/api/admin/moderation/messages/flagged');
      setFlaggedMessages(response.data.data);
    } catch (error) {
      console.error('Error loading flagged messages:', error);
      toast.error('Failed to load flagged messages');
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await axios.get('/api/admin/moderation/audit-log');
      setAuditLogs(response.data.data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageAction = async (messageId, action, reason = '') => {
    try {
      let endpoint = '';
      let method = 'post';
      
      switch (action) {
        case 'hide':
          endpoint = `/api/admin/moderation/messages/${messageId}/hide`;
          break;
        case 'delete':
          endpoint = `/api/admin/moderation/messages/${messageId}`;
          method = 'delete';
          break;
        case 'unflag':
          endpoint = `/api/admin/moderation/messages/${messageId}/flag`;
          method = 'delete';
          break;
        default:
          return;
      }

      const config = {
        method,
        url: endpoint,
        data: method === 'delete' ? { reason } : { reason }
      };

      await axios(config);
      
      toast.success(`Message ${action}d successfully`);
      loadFlaggedMessages();
      loadAuditLogs();
    } catch (error) {
      console.error(`Error ${action}ing message:`, error);
      toast.error(`Failed to ${action} message`);
    }
  };

  const handleUserBan = async (userId, banType = 'temporary', duration = 24, reason = '') => {
    try {
      await axios.post(`/api/admin/moderation/users/${userId}/ban`, {
        reason,
        banType,
        duration
      });
      
      toast.success('User banned successfully');
      loadAuditLogs();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'message_flagged':
        return <FlagIcon className="w-4 h-4 text-orange-500" />;
      case 'message_hidden':
        return <EyeSlashIcon className="w-4 h-4 text-red-500" />;
      case 'message_deleted':
        return <TrashIcon className="w-4 h-4 text-red-500" />;
      case 'user_banned':
        return <ShieldCheckIcon className="w-4 h-4 text-red-500" />;
      case 'chat_muted':
        return <ChatBubbleLeftRightIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'message_flagged':
        return 'bg-orange-100 text-orange-800';
      case 'message_hidden':
      case 'message_deleted':
        return 'bg-red-100 text-red-800';
      case 'user_banned':
        return 'bg-red-100 text-red-800';
      case 'chat_muted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFlaggedMessages = flaggedMessages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.performedBy?.fullName && log.performedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderation Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage flagged content and user moderation</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages, users, or actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('flagged')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'flagged'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Flagged Messages ({filteredFlaggedMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audit Log ({filteredAuditLogs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Flagged Messages Tab */}
      {activeTab === 'flagged' && (
        <div className="space-y-4">
          {filteredFlaggedMessages.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No flagged messages</h3>
              <p className="mt-1 text-sm text-gray-500">All messages are clean!</p>
            </div>
          ) : (
            filteredFlaggedMessages.map((message) => (
              <div key={message._id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{message.sender.fullName}</p>
                        <p className="text-sm text-gray-500">{formatTimestamp(message.createdAt)}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{message.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {message.flaggedBy.map((flag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <FlagIcon className="w-3 h-3 mr-1" />
                          {flag.reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowMessageModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View full message"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleMessageAction(message._id, 'unflag')}
                      className="p-2 text-green-600 hover:text-green-800"
                      title="Unflag message"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleMessageAction(message._id, 'hide', 'Hidden by moderator')}
                      className="p-2 text-yellow-600 hover:text-yellow-800"
                      title="Hide message"
                    >
                      <EyeSlashIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleMessageAction(message._id, 'delete', 'Deleted by moderator')}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete message"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {filteredAuditLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
              <p className="mt-1 text-sm text-gray-500">No moderation actions have been taken yet.</p>
            </div>
          ) : (
            filteredAuditLogs.map((log) => (
              <div key={log._id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log.action)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.performedBy?.fullName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTimestamp(log.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                
                {log.reason && (
                  <p className="mt-2 text-sm text-gray-600">{log.reason}</p>
                )}
                
                {log.targetUser && (
                  <p className="mt-1 text-sm text-gray-500">
                    Target: {log.targetUser.fullName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Message Details</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <p className="mt-1 text-gray-900">{selectedMessage.content}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sender</label>
                  <p className="mt-1 text-gray-900">{selectedMessage.sender.fullName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-gray-900">{formatTimestamp(selectedMessage.createdAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chat</label>
                  <p className="mt-1 text-gray-900">{selectedMessage.chatId?.name || 'Unknown Chat'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationDashboard;
