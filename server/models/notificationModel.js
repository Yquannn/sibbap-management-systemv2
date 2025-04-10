const db = require('../config/db'); // make sure your db connection is exported from here

const Notification = {
  create: async (userId, message) => {
    const [result] = await db.execute(
      'INSERT INTO notifications (userId, message) VALUES (?, ?)',
      [userId, message]
    );
    return result;
  },

  findByUserId: async (userId) => {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return rows;
  },

  markAsRead: async (notificationId) => {
    const [result] = await db.execute(
      'UPDATE notifications SET isRead = 1 WHERE id = ?',
      [notificationId]
    );
    return result;
  }
};

module.exports = Notification;
