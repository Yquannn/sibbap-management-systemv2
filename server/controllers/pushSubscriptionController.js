// controllers/subscriptionController.js
const { saveSubscription, deleteSubscription } = require('../models/pushSubscriptionModel');

// Save subscription endpoint
exports.subscribe = async (req, res) => {
  const { subscription } = req.body;
  const userId = req.userId; // Assuming you have authentication middleware that sets this
  
  if (!subscription) {
    return res.status(400).json({ message: 'Subscription data is required' });
  }
  
  try {
    await saveSubscription(userId, subscription);
    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Error saving subscription' });
  }
};

// Unsubscribe endpoint
exports.unsubscribe = async (req, res) => {
  const userId = req.userId; // Assuming you have authentication middleware that sets this
  
  try {
    await deleteSubscription(userId);
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ message: 'Error deleting subscription' });
  }
};

// controllers/pushNotificationController.js - add this function
exports.getVapidPublicKey = (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
  };
  
  // routes/pushNotificationRoutes.js - add this route
