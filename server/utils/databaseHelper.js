// utils/helper.js
const db = require('../config/db');

// Query the database
const queryDatabase = async (query, params) => {
  const connection = await db.getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
};
const generateUniqueMemberCode = async () => {
  // Use a two-digit year prefix (e.g., "25" for 2025)
  const currentYear = String(new Date().getFullYear()).slice(2);

  // Query to get the maximum memberCode that starts with the current year
  const query = 'SELECT MAX(memberCode) AS maxCode FROM members WHERE memberCode LIKE ?';
  const queryParams = [`${currentYear}%`];

  try {
    const results = await queryDatabase(query, queryParams);
    const maxCode = results[0]?.maxCode;
    
    // If a member code exists, remove the first two characters (the year prefix)
    // and increment the numeric part; otherwise, start at 1.
    const newNumericPart = maxCode ? parseInt(maxCode.slice(2), 10) + 1 : 1;
    
    // Pad the numeric part with zeros to ensure it is always 4 digits.
    const newMemberCode = currentYear + String(newNumericPart).padStart(4, '0');
    return newMemberCode;
  } catch (error) {
    console.error('Error generating unique member ID:', error);
    throw new Error('Error generating unique member ID');
  }
};


// Format a date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

module.exports = { queryDatabase, generateUniqueMemberCode, formatDate };
