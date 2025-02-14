const db = require('../config/db');


exports.findByEmail = async (email) => {
  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return user[0]; 
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw new Error('Error finding user');
  }
};


exports.findMembers = async (email) => {
  try {
    const [members] = await db.query('SELECT email FROM members WHERE email = ?', [email]);
    return members; 
  } catch (error) {
    console.error('Error finding members:', error.message);
    throw new Error('Error finding members');
  }
}
