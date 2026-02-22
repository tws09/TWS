// Firebase Configuration for TWS Frontend
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4nwRQKTFp2i88MjuP95ZUkFucesilIOI",
  authDomain: "tws-web-app.firebaseapp.com",
  projectId: "tws-web-app",
  storageBucket: "tws-web-app.firebasestorage.app",
  messagingSenderId: "514644495359",
  appId: "1:514644495359:web:f6434649d3bdcbf5d135ca",
  measurementId: "G-KNXF6F7449"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// Initialize Analytics (only in production)
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}
export { analytics };

// Export the app instance
export default app;

// Firebase service worker registration for messaging - DISABLED
export const registerServiceWorker = async () => {
  // Service worker disabled to prevent errors
  console.log('Firebase Service Worker registration disabled');
  return null;
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Firebase service worker registration failed:', error);
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};
