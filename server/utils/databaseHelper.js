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

// Generate a unique member ID
const generateUniqueMemberId = async () => {
  const currentYear = new Date().getFullYear() % 100; 
  let uniqueId = `${currentYear}`; 

  const query = 'SELECT MAX(CAST(memberCode AS UNSIGNED)) AS maxId FROM members WHERE memberCode LIKE ?';
  const queryParams = [`${currentYear}%`]; 

  try {
    const results = await queryDatabase(query, queryParams);
    const maxId = results[0]?.maxId; 
    const newId = maxId ? parseInt(maxId.toString().slice(2)) + 1 : 1;
    uniqueId += String(newId).padStart(4, '0'); 
    return uniqueId;
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

module.exports = { queryDatabase, generateUniqueMemberId, formatDate };
