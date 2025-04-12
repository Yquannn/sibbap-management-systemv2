const Notification = require('../models/notificationModel');

exports.createNotification = async (req, res) => {
  try {
    const { userId, userType, message } = req.body;
    // Pass an object to the model. If userType is provided,
    // a notification will be sent to all users of that type.
    await Notification.create({ userId, message, userType });
    res.json({ success: true, message: 'Notification sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification.' });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.findByUserId(userId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
};
