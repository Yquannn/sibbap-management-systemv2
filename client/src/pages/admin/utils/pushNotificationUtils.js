// Convert base64 string to Uint8Array for Web Push
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  // Register the service worker
  export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service workers are not supported in this browser');
    }
  }
  
  // Request notification permission
  export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
  
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Subscribe to push notifications
  export async function subscribeToPushNotifications() {
    try {
      // Make sure service worker is registered
      const registration = await navigator.serviceWorker.ready;
      
      // Get the server's public key
      const response = await fetch('http://localhost:3001/api/vapid-public-key');
      const vapidPublicKey = await response.text();
      
      // Convert the public key to the format expected by the browser
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe the user
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Send the subscription to the server
      await saveSubscriptionOnServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }
  
  // Save subscription on server
  async function saveSubscriptionOnServer(subscription) {
    // Get a valid user ID - either from session storage or use a default that exists
    // You need to make sure this ID exists in your users table
    const userId = sessionStorage.getItem('userid') || '1'; 
    
    try {
      const response = await fetch('http://localhost:3001/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userId,
          subscription: subscription 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }
  
  // Check if push notifications are supported
  export function isPushNotificationSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
  
  // Check if the user is already subscribed
  export async function checkPushNotificationSubscription() {
    if (!isPushNotificationSupported()) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
  
  // Unsubscribe from push notifications
  export async function unsubscribeFromPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();
        
        // Tell the server about the unsubscription
        await fetch('http://localhost:3001/api/unsubscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId: sessionStorage.getItem('userId') || '1'
          })
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }