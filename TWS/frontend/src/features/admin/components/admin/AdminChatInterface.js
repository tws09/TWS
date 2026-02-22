import React, { useState, useEffect, useRef } from 'react';
import { 
  UserIcon, 
  PaperAirplaneIcon, 
  PaperClipIcon,
  EmojiHappyIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '../../../../app/providers/SocketContext';
import axios from 'axios';

const AdminChatInterface = ({ onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState('direct'); // 'direct' or 'broadcast'
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  // Load employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setEmployees(response.data.users || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Load messages when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      loadMessages(selectedEmployee._id);
    }
  }, [selectedEmployee]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    const handleNewMessage = (message) => {
      if (message.sender === selectedEmployee?._id || message.recipient === selectedEmployee?._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleMessageStatus = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: data.status, readAt: data.readAt }
          : msg
      ));
    };

    try {
      socket.on('new-message', handleNewMessage);
      socket.on('message-status', handleMessageStatus);
    } catch (error) {
      console.error('Error setting up socket listeners:', error);
    }

    return () => {
      try {
        if (socket && typeof socket.off === 'function') {
          socket.off('new-message', handleNewMessage);
          socket.off('message-status', handleMessageStatus);
        }
      } catch (error) {
        console.error('Error cleaning up socket listeners:', error);
      }
    };
  }, [socket, selectedEmployee]);

  const loadMessages = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/admin/messaging/chat/${employeeId}`);
      setMessages(response.data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        recipient: selectedEmployee._id,
        type: 'admin-message',
        priority: 'high'
      };

      if (chatMode === 'broadcast' && selectedEmployees.length > 0) {
        // Send broadcast message to multiple employees
        for (const employee of selectedEmployees) {
          await axios.post('/api/admin/messaging/send', {
            ...messageData,
            recipient: employee._id
          });
        }
      } else {
        // Send direct message
        await axios.post('/api/admin/messaging/send', messageData);
      }

      setNewMessage('');
      // Reload messages to show the new one
      if (selectedEmployee) {
        loadMessages(selectedEmployee._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEmployeeSelection = (employee) => {
    if (chatMode === 'broadcast') {
      setSelectedEmployees(prev => 
        prev.find(emp => emp._id === employee._id)
          ? prev.filter(emp => emp._id !== employee._id)
          : [...prev, employee]
      );
    } else {
      setSelectedEmployee(employee);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex">
        {/* Left Sidebar - Employee List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Admin Chat
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Chat Mode Toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setChatMode('direct')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  chatMode === 'direct'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <UserIcon className="h-4 w-4 inline mr-1" />
                Direct
              </button>
              <button
                onClick={() => setChatMode('broadcast')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  chatMode === 'broadcast'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                Broadcast
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmployees.map((employee) => {
              const isSelected = chatMode === 'direct' 
                ? selectedEmployee?._id === employee._id
                : selectedEmployees.find(emp => emp._id === employee._id);
              
              return (
                <div
                  key={employee._id}
                  onClick={() => toggleEmployeeSelection(employee)}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {employee.name || employee.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {employee.role} • {employee.department || 'No Department'}
                      </p>
                    </div>
                    {chatMode === 'broadcast' && isSelected && (
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedEmployee || (chatMode === 'broadcast' && selectedEmployees.length > 0) ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {chatMode === 'direct' 
                        ? selectedEmployee?.name || selectedEmployee?.email
                        : `Broadcast to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}`
                      }
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {chatMode === 'direct' 
                        ? `${selectedEmployee?.role} • ${selectedEmployee?.department || 'No Department'}`
                        : 'Admin broadcast message'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'admin'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'admin' ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                          {message.sender === 'admin' && message.status && (
                            <span className="ml-2">
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Type your message${chatMode === 'broadcast' ? ' to selected employees' : ''}...`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select an Employee to Start Chatting
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose an employee from the list to begin a conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatInterface;
