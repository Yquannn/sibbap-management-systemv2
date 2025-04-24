const db = require('../config/db');

// Save subscription endpoint
exports.subscribe = async (req, res) => {
  const { userId, subscription } = req.body;
  
  if (!subscription) {
    return res.status(400).json({ message: 'Subscription data is required' });
  }
  
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
    
    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Error saving subscription' });
  }
};

// Unsubscribe endpoint
exports.unsubscribe = async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    await db.execute(
      'DELETE FROM push_subscriptions WHERE userId = ?',
      [userId]
    );
    
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ message: 'Error deleting subscription' });
  }
};