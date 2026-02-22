// Service Worker Registration and PWA Install Handler
// TWS ERP Platform

(function () {
    'use strict';

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
        // Register service worker
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('✅ ServiceWorker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 New ServiceWorker installing...');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            showUpdateNotification();
                        }
                    });
                });

                // Check for updates periodically (every hour)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                console.error('❌ ServiceWorker registration failed:', error);
            }
        });
    } else {
        console.warn('⚠️ ServiceWorker not supported');
    }

    // PWA Install Prompt
    let deferredPrompt;
    const installButton = document.getElementById('installButton');

    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💡 Install prompt available');

        // Prevent the mini-infobar from appearing
        e.preventDefault();

        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show install button
        if (installButton) {
            installButton.style.display = 'inline-flex';
        }
    });

    // Handle install button click
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (!deferredPrompt) {
                return;
            }

            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);

            // Reset the deferred prompt variable
            deferredPrompt = null;

            // Hide the install button
            installButton.style.display = 'none';

            // Show feedback
            if (outcome === 'accepted') {
                showNotification('App installed successfully! 🎉', 'success');
            }
        });
    }

    // Track install event
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA was installed');
        deferredPrompt = null;

        // Hide install button
        if (installButton) {
            installButton.style.display = 'none';
        }

        // Analytics or other tracking
        trackEvent('pwa_install', {
            timestamp: new Date().toISOString()
        });
    });

    // Show update notification
    function showUpdateNotification() {
        const toast = document.getElementById('updateToast');
        if (toast) {
            toast.style.display = 'flex';

            const updateButton = document.getElementById('updateButton');
            const dismissButton = document.getElementById('dismissUpdate');

            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    // Tell the service worker to skip waiting
                    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });

                    // Reload the page
                    window.location.reload();
                });
            }

            if (dismissButton) {
                dismissButton.addEventListener('click', () => {
                    toast.style.display = 'none';
                });
            }
        }
    }

    // Check if app is running as standalone PWA
    function isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://')
        );
    }

    // Add standalone class to body if running as PWA
    if (isStandalone()) {
        document.body.classList.add('pwa-standalone');
        console.log('📱 Running as standalone PWA');
    }

    // Network status monitoring
    function updateOnlineStatus() {
        const condition = navigator.onLine ? 'online' : 'offline';
        console.log(`🌐 Network status: ${condition}`);

        if (!navigator.onLine) {
            showNotification('You are currently offline. Some features may be limited.', 'warning');
        }

        document.body.classList.toggle('offline', !navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Show notification helper
    function showNotification(message, type = 'info') {
        console.log(`[${type}] ${message}`);

        // You can implement a toast/notification UI here
        // For now, just using console

        // Example: Create a toast element
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Track events (placeholder for analytics)
    function trackEvent(eventName, data = {}) {
        console.log('📊 Event tracked:', eventName, data);

        // Integrate with your analytics here
        // Example: Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }

    // Request notification permission
    async function requestNotificationPermission() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('✅ Notification permission granted');

                // Subscribe to push notifications
                subscribeToPushNotifications();
            } else {
                console.log('❌ Notification permission denied');
            }
        }
    }

    // Subscribe to push notifications
    async function subscribeToPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Subscribe to push notifications
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        // Replace with your VAPID public key
                        'YOUR_VAPID_PUBLIC_KEY_HERE'
                    )
                });

                console.log('✅ Push subscription:', subscription);

                // Send subscription to your server
                await sendSubscriptionToServer(subscription);
            }
        } catch (error) {
            console.error('❌ Push subscription failed:', error);
        }
    }

    // Helper function for VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    // Send subscription to server
    async function sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                console.log('✅ Subscription sent to server');
            }
        } catch (error) {
            console.error('❌ Failed to send subscription:', error);
        }
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    .update-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }
    
    .update-toast p {
      margin: 0;
      font-weight: 600;
    }
    
    .update-toast .btn {
      margin: 0;
    }
    
    .update-toast .btn-small {
      padding: 8px 16px;
      font-size: 14px;
    }
    
    /* PWA standalone styles */
    body.pwa-standalone {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
    
    /* Offline indicator */
    body.offline::before {
      content: "You're offline";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      text-align: center;
      padding: 8px;
      z-index: 9999;
      font-size: 14px;
      font-weight: 600;
    }
  `;
    document.head.appendChild(style);

    // Optional: Request notification permission on first visit
    // Uncomment if you want to ask for permission immediately
    // setTimeout(() => {
    //   requestNotificationPermission();
    // }, 5000);

    console.log('🚀 PWA initialized');
})();
