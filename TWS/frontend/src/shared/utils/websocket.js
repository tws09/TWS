/**
 * Secure WebSocket Client
 * Handles authenticated WebSocket connections with proper error handling
 */

import { getToken } from './auth';
import { createLogger } from './logger';

const logger = createLogger('WebSocket');

/**
 * Create secure WebSocket connection
 * @param {string} endpoint - WebSocket endpoint (relative path)
 * @param {Object} options - Connection options
 * @returns {WebSocket} WebSocket instance
 */
export const createSecureWebSocket = (endpoint, options = {}) => {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    protocols = []
  } = options;

  let ws = null;
  let reconnectAttempts = 0;
  let reconnectTimeout = null;
  let isManualClose = false;

  const connect = () => {
    try {
      // Get authentication token
      const token = getToken();
      if (!token) {
        logger.error('Cannot create WebSocket: No authentication token');
        if (onError) {
          onError(new Error('Authentication required'));
        }
        return null;
      }

      // Construct secure WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${endpoint}?token=${encodeURIComponent(token)}`;
      
      // Create WebSocket connection
      ws = new WebSocket(wsUrl, protocols);

      // Connection opened
      ws.onopen = (event) => {
        logger.info('WebSocket connected', { endpoint });
        reconnectAttempts = 0;
        
        // Send authentication message
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            token: token
          }));
        }
        
        if (onOpen) {
          onOpen(event);
        }
      };

      // Handle messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle authentication response
          if (data.type === 'auth_response') {
            if (!data.authenticated) {
              logger.error('WebSocket authentication failed');
              ws.close();
              if (onError) {
                onError(new Error('Authentication failed'));
              }
              return;
            }
            logger.info('WebSocket authenticated successfully');
          }
          
          if (onMessage) {
            onMessage(data, event);
          }
        } catch (error) {
          logger.error('Error parsing WebSocket message', error);
          if (onError) {
            onError(error);
          }
        }
      };

      // Handle errors
      ws.onerror = (error) => {
        logger.error('WebSocket error', error);
        if (onError) {
          onError(error);
        }
      };

      // Handle connection close
      ws.onclose = (event) => {
        logger.warn('WebSocket closed', { code: event.code, reason: event.reason });
        
        if (onClose) {
          onClose(event);
        }

        // Attempt to reconnect if not manually closed
        if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
          
          logger.info(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          logger.error('Max reconnection attempts reached');
          if (onError) {
            onError(new Error('Failed to reconnect after maximum attempts'));
          }
        }
      };

      return ws;
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error);
      if (onError) {
        onError(error);
      }
      return null;
    }
  };

  // Start connection
  const connection = connect();

  // Return connection object with control methods
  return {
    ws: connection,
    send: (data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        if (typeof data === 'string') {
          ws.send(data);
        } else {
          ws.send(JSON.stringify(data));
        }
      } else {
        logger.warn('Cannot send message: WebSocket not connected');
      }
    },
    close: () => {
      isManualClose = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    },
    reconnect: () => {
      isManualClose = false;
      reconnectAttempts = 0;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
      connect();
    },
    isConnected: () => {
      return ws && ws.readyState === WebSocket.OPEN;
    }
  };
};

/**
 * Subscribe to WebSocket channel
 * @param {WebSocket} ws - WebSocket connection object
 * @param {string|Array} channels - Channel(s) to subscribe to
 */
export const subscribeToChannels = (ws, channels) => {
  if (!ws || !ws.isConnected()) {
    logger.warn('Cannot subscribe: WebSocket not connected');
    return;
  }

  const channelArray = Array.isArray(channels) ? channels : [channels];
  
  ws.send({
    type: 'subscribe',
    channels: channelArray
  });
  
  logger.info('Subscribed to channels', { channels: channelArray });
};

/**
 * Unsubscribe from WebSocket channel
 * @param {WebSocket} ws - WebSocket connection object
 * @param {string|Array} channels - Channel(s) to unsubscribe from
 */
export const unsubscribeFromChannels = (ws, channels) => {
  if (!ws || !ws.isConnected()) {
    logger.warn('Cannot unsubscribe: WebSocket not connected');
    return;
  }

  const channelArray = Array.isArray(channels) ? channels : [channels];
  
  ws.send({
    type: 'unsubscribe',
    channels: channelArray
  });
  
  logger.info('Unsubscribed from channels', { channels: channelArray });
};

