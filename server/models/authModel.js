const db = require('../config/db');

exports.findByEmail = async (email) => {
  try {
    // Check if email exists in `member_account`
    const [member] = await db.query(
      `SELECT memberId AS id, email, password, 'Member' AS userType 
       FROM member_account 
       WHERE email = ? AND accountStatus = 'ACTIVATED'`, 
      [email]
    );

    if (member.length > 0) {
      return member[0]; // Return Member Data
    }

    // If not found in `member_account`, check `users`
    const [user] = await db.query(
      `SELECT id AS id, email, password, userType 
       FROM users 
       WHERE email = ?`, 
      [email]
    );

    if (user.length > 0) {
      return user[0]; // Return User Data
    }

    return null; // User not found
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw new Error('Error finding user');
  }
};
