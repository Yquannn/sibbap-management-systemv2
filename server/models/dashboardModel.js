const db = require('../config/db');

// Generic function to execute database queries
const queryDatabase = async (query, params = []) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw new Error('Error executing query');
  }
};

// Fetch total members from the database
const getTotalMembers = async () => {
  const query = 'SELECT COUNT(*) AS total_members FROM members';
  return queryDatabase(query);
};

module.exports = { getTotalMembers };
