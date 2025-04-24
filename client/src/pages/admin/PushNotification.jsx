import React, { useState, useEffect } from 'react';
import { 
  isPushNotificationSupported, 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkPushNotificationSubscription 
} from '../admin/utils/pushNotificationUtils';

const PushNotificationTest = () => {
  const [status, setStatus] = useState('Checking support...');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (!isPushNotificationSupported()) {
        setStatus('Push notifications are not supported in this browser');
        return;
      }

      setStatus(`Permission: ${Notification.permission}`);
      
      const subscribed = await checkPushNotificationSubscription();
      setIsSubscribed(subscribed);
    };

    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const permissionGranted = await requestNotificationPermission();
      
      if (permissionGranted) {
        await subscribeToPushNotifications();
        setIsSubscribed(true);
        setMessage('Successfully subscribed to push notifications!');
        setStatus(`Permission: ${Notification.permission}`);
      } else {
        setMessage('Permission denied for notifications');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      setMessage('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification',
          icon: '/icon.png'
        })
      });
      
      const result = await response.json();
      setMessage(`Server response: ${result.message}`);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Push Notification Test</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Subscribed:</strong> {isSubscribed ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="flex space-x-2 mb-6">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? 'Processing...' : 'Unsubscribe'}
          </button>
        )}
        
        {isSubscribed && (
          <button
            onClick={sendTestNotification}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Sending...' : 'Send Test Notification'}
          </button>
        )}
      </div>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PushNotificationTest;