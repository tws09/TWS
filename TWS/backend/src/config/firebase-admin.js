// Firebase Admin SDK Configuration for TWS Backend
const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin configuration
const firebaseAdminConfig = {
  projectId: "tws-web-app",
  databaseURL: "https://tws-web-app-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin SDK
let firebaseAdmin = null;

const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      // Try to use service account key file if it exists
      const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
      
      try {
        const serviceAccount = require(serviceAccountPath);
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          ...firebaseAdminConfig
        });
        console.log('✅ Firebase Admin SDK initialized with service account');
      } catch (serviceAccountError) {
        // Fallback to environment variables or default credentials
        console.log('⚠️  Service account file not found, using environment variables or default credentials');
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          ...firebaseAdminConfig
        });
        console.log('✅ Firebase Admin SDK initialized with default credentials');
      }
    } else {
      firebaseAdmin = admin.app();
      console.log('✅ Firebase Admin SDK already initialized');
    }
    
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Get Firebase Admin instance
const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
};

// Firebase Admin services
const getFirebaseServices = () => {
  const admin = getFirebaseAdmin();
  
  return {
    auth: admin.auth(),
    firestore: admin.firestore(),
    messaging: admin.messaging(),
    storage: admin.storage(),
    database: admin.database()
  };
};

// Verify Firebase Admin connection
const verifyFirebaseConnection = async () => {
  try {
    const { auth } = getFirebaseServices();
    // Try to list users to verify connection
    await auth.listUsers(1);
    console.log('✅ Firebase Admin connection verified');
    return true;
  } catch (error) {
    console.error('❌ Firebase Admin connection failed:', error);
    return false;
  }
};

// Send notification to user
const sendNotificationToUser = async (userId, notification) => {
  try {
    const { messaging } = getFirebaseServices();
    
    const message = {
      token: userId, // This should be the FCM token
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          requireInteraction: true
        }
      }
    };

    const response = await messaging.send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    throw error;
  }
};

// Send notification to topic
const sendNotificationToTopic = async (topic, notification) => {
  try {
    const { messaging } = getFirebaseServices();
    
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          requireInteraction: true
        }
      }
    };

    const response = await messaging.send(message);
    console.log('✅ Topic notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send topic notification:', error);
    throw error;
  }
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const { auth } = getFirebaseServices();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('❌ Failed to verify ID token:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseAdmin,
  getFirebaseServices,
  verifyFirebaseConnection,
  sendNotificationToUser,
  sendNotificationToTopic,
  verifyIdToken
};
