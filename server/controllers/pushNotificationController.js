// controllers/pushNotificationController.js
const webpush = require('web-push'); // You'll need to install this npm package

// Configure web-push with your VAPID keys
// You can generate these using the web-push generate-vapid-keys command
webpush.setVapidDetails(
    'mailto:dondonbautista1223@gmail.com', // Add 'mailto:' prefix
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
// Function to send push notifications
exports.sendPushNotification = async (req, res) => {
  const { title, body, targetUsers, data } = req.body;
  
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }
  
  try {
    // Get subscription details from the database
    const subscriptions = await getSubscriptionsForTargetUsers(targetUsers);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscribed users found' });
    }
    
    // The notification payload
    const notificationPayload = {
      notification: {
        title: title,
        body: body,
        icon: '/icon.png', // Path to your notification icon
        badge: '/badge.png', // Path to your notification badge
        vibrate: [100, 50, 100],
        data: data || {}
      }
    };
    
    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(subscription => {
      return webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      );
    });
    
    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);
    
    res.status(200).json({
      message: 'Push notifications sent successfully',
      sentTo: subscriptions.length
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({ message: 'Error sending push notifications' });
  }
};

// Helper function to get subscriptions for targeted users
async function getSubscriptionsForTargetUsers(targetUsers) {
    const db = require('../config/db');
    
    try {
      let query;
      let params = [];
      
      // Add this check to handle undefined targetUsers
      if (!targetUsers) {
        // Default to fetching all subscriptions if targetUsers is not specified
        query = 'SELECT subscription FROM push_subscriptions';
      } else if (targetUsers === 'all') {
        // Get all subscriptions
        query = 'SELECT subscription FROM push_subscriptions';
      } else {
        // Get subscriptions for specific user types
        const userTypes = targetUsers.split(',');
        query = `
          SELECT ps.subscription 
          FROM push_subscriptions ps
          JOIN users u ON ps.userId = u.id
          WHERE u.userType IN (${userTypes.map(() => '?').join(',')})
        `;
        params = userTypes;
      }
      
      const [results] = await db.execute(query, params);
      
      // Parse JSON subscription strings from database
      return results.map(row => JSON.parse(row.subscription));
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

// Add this function to your pushNotificationController.js
exports.getVapidPublicKey = (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
  };

  // Add this to your pushNotificationController.js
exports.testNotification = async (req, res) => {
    try {
      // Create a dummy valid subscription (this is for testing only)
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      
      const options = {
        // This is a minimal notification
        TTL: 60,
        vapidDetails: {
          subject: 'mailto:dondonbautista1223@gmail.com',
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey
        }
      };
      
      // Log information but don't actually try to send
      console.log('Test notification would be sent with these details:', {
        title: req.body.title || 'Test Notification',
        body: req.body.body || 'This is a test notification',
        options
      });
      
      res.status(200).json({ 
        message: 'Test notification simulation successful',
        note: 'No actual notifications were sent as this is just a server-side test'
      });
    } catch (error) {
      console.error('Error in test notification:', error);
      res.status(500).json({ message: 'Error running notification test' });
    }
  };