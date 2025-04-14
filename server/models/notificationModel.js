const db = require('../config/db'); // make sure your db connection is exported from here

const Notification = {
  /**
   * Create a notification.
   * Accepts an object with { userId, message, userType }.
   * - If userType is provided (can be a string or array), a notification is inserted for all users with that type or types.
   * - If userId is provided, a notification is inserted for that specific user.
   */
  create: async ({ userId, message, userType }) => {
    // If a userType is provided, send notification to all users of that type or types
    if (userType) {
      let users = [];
      // Check if userType is an array; if so, use an IN clause to fetch all matching users.
      if (Array.isArray(userType)) {
        const placeholders = userType.map(() => '?').join(',');
        [users] = await db.execute(
          `SELECT id FROM users WHERE userType IN (${placeholders})`,
          userType
        );
      } else {
        // Single user type provided
        [users] = await db.execute(
          'SELECT id FROM users WHERE userType = ?',
          [userType]
        );
      }

      // Insert notifications for each matching user
      const results = [];
      for (const user of users) {
        const [result] = await db.execute(
          'INSERT INTO notifications (userId, message) VALUES (?, ?)',
          [user.id, message]
        );
        results.push(result);
      }
      return results;
    }
    // Fallback: if userId is provided, insert the notification for that user
    else if (userId) {
      const [result] = await db.execute(
        'INSERT INTO notifications (userId, message) VALUES (?, ?)',
        [userId, message]
      );
      return result;
    }
    // If neither userType nor userId is provided, throw an error
    else {
      throw new Error('Either userId or userType must be provided');
    }
  },

// Retrieve notifications for a specific user ordered by creation date descending
// including announcement data when notification is related to an announcement
findByUserId: async (userId) => {
  const [rows] = await db.execute(
    `SELECT n.*, a.*
     FROM notifications n
     LEFT JOIN announcements a ON n.announcement_id = a.announcement_id
     WHERE n.userId = ? 
     ORDER BY n.createdAt DESC`,
    [userId]
  );
  return rows;
},

  // Mark a specific notification as read
  markAsRead: async (notificationId) => {
    const [result] = await db.execute(
      'UPDATE notifications SET isRead = 1 WHERE id = ?',
      [notificationId]
    );
    return result;
  }
};

module.exports = Notification;
