import { useState, useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';

const useMonitoringWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const subscriptionsRef = useRef(new Set());
  
  const {
    maxReconnectAttempts = 5,
    reconnectInterval = 1000,
    onOpen,
    onClose,
    onError,
    onMessage,
    autoConnect = true,
    debug = false
  } = options;

  const log = useCallback((message, ...args) => {
    if (debug) {
      console.log(`[MonitoringWebSocket] ${message}`, ...args);
    }
  }, [debug]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Already connected');
      return;
    }

    try {
      log('Connecting to:', url);
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = (event) => {
        log('WebSocket connected');
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
        setSocket(wsRef.current);
        
        // Resubscribe to previous subscriptions
        subscriptionsRef.current.forEach(channel => {
          subscribe(channel);
        });
        
        if (onOpen) {
          onOpen(event);
        }
        
        notification.success({
          message: 'Real-time Monitoring Connected',
          description: 'Live system monitoring is now active',
          placement: 'topRight',
          duration: 3
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          log('Message received:', data);
          
          setLastMessage(data);
          
          // Call global message handler
          if (onMessage) {
            onMessage(data);
          }
          
          // Call specific message type handlers
          const handler = messageHandlersRef.current.get(data.type);
          if (handler) {
            handler(data);
          }
          
        } catch (error) {
          log('Error parsing message:', error);
          setError('Failed to parse message');
        }
      };

      wsRef.current.onclose = (event) => {
        log('WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        setSocket(null);
        
        if (onClose) {
          onClose(event);
        }
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 30000);
          log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          notification.warning({
            message: 'Connection Lost',
            description: `Reconnecting in ${delay/1000} seconds... (${reconnectAttempts + 1}/${maxReconnectAttempts})`,
            placement: 'topRight',
            duration: 4
          });
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          notification.error({
            message: 'Connection Failed',
            description: 'Unable to establish real-time monitoring connection',
            placement: 'topRight',
            duration: 0
          });
        }
      };

      wsRef.current.onerror = (error) => {
        log('WebSocket error:', error);
        setError('WebSocket connection error');
        
        if (onError) {
          onError(error);
        }
      };

    } catch (error) {
      log('Failed to create WebSocket:', error);
      setError('Failed to create WebSocket connection');
    }
  }, [url, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage, log]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setConnected(false);
    setSocket(null);
    setReconnectAttempts(0);
    
    log('WebSocket disconnected manually');
  }, [log]);

  const send = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
      log('Message sent:', message);
      return true;
    } else {
      log('Cannot send message: WebSocket not connected');
      setError('Cannot send message: WebSocket not connected');
      return false;
    }
  }, [log]);

  const subscribe = useCallback((channels) => {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    
    // Add to subscriptions
    channelArray.forEach(channel => {
      subscriptionsRef.current.add(channel);
    });
    
    // Send subscription message
    return send({
      type: 'subscribe',
      channels: channelArray
    });
  }, [send]);

  const unsubscribe = useCallback((channels) => {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    
    // Remove from subscriptions
    channelArray.forEach(channel => {
      subscriptionsRef.current.delete(channel);
    });
    
    // Send unsubscription message
    return send({
      type: 'unsubscribe',
      channels: channelArray
    });
  }, [send]);

  const addMessageHandler = useCallback((messageType, handler) => {
    messageHandlersRef.current.set(messageType, handler);
    log(`Added message handler for: ${messageType}`);
  }, [log]);

  const removeMessageHandler = useCallback((messageType) => {
    messageHandlersRef.current.delete(messageType);
    log(`Removed message handler for: ${messageType}`);
  }, [log]);

  const getSubscriptions = useCallback(() => {
    return Array.from(subscriptionsRef.current);
  }, []);

  const clearSubscriptions = useCallback(() => {
    subscriptionsRef.current.clear();
    log('Cleared all subscriptions');
  }, [log]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    connected,
    error,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    getSubscriptions,
    clearSubscriptions
  };
};

export default useMonitoringWebSocket;
