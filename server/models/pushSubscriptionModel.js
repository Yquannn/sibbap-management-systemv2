// models/pushSubscriptionModel.js
const db = require('../config/db');

// Save a new push subscription
exports.saveSubscription = async (userId, subscription) => {
  try {
    // Check if subscription already exists for this user
    const [existing] = await db.execute(
      'SELECT * FROM push_subscriptions WHERE userId = ?',
      [userId]
    );
    
    if (existing.length > 0) {
      // Update existing subscription
      await db.execute(
        'UPDATE push_subscriptions SET subscription = ? WHERE userId = ?',
        [JSON.stringify(subscription), userId]
      );
    } else {
      // Insert new subscription
      await db.execute(
        'INSERT INTO push_subscriptions (userId, subscription) VALUES (?, ?)',
        [userId, JSON.stringify(subscription)]
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw new Error('Failed to save subscription');
  }
};

// Delete a push subscription
exports.deleteSubscription = async (userId) => {
  try {
    await db.execute(
      'DELETE FROM push_subscriptions WHERE userId = ?',
      [userId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw new Error('Failed to delete subscription');
  }
};