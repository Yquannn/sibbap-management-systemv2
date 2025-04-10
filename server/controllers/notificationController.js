const Notification = require('../models/notificationModel');

exports.createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    await Notification.create(userId, message);
    res.json({ success: true, message: 'Notification sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification.' });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.findByUserId(userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
};
