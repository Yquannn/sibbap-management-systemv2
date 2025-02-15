const db = require('../config/db');

exports.findByEmail = async (email) => {
  try {
    // Check if the email exists in the `member_account` table
    const [member] = await db.query(
      'SELECT * FROM member_account WHERE email = ? AND accountStatus = "ACTIVATED"', 
      [email]
    );
        if (member.length > 0) {
      return { ...member[0], userType: 'Member' }; // Include userType
    }

    // // If not found in `member_account`, check the `users` table
    // const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // if (user.length > 0) {
    //   return { ...user[0], userType: user[0].role }; // Use role as userType
    // }

    return null; // User not found
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw new Error('Error finding user');
  }
};

