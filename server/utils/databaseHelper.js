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


const generateUniqueMemberCode = async (share_capital) => {
  const currentYear = String(new Date().getFullYear()).slice(2); // e.g., '25'
  
  // Determine prefix and type
  const memberType = share_capital < 6000 ? "Partial Member" : "Regular Member";
  const codePrefix = share_capital < 6000 ? "PM-" : "RM-";

  // Example LIKE 'PM-25%' or 'RM-25%'
  const query = `
    SELECT MAX(CAST(SUBSTRING(memberCode, 6) AS UNSIGNED)) AS maxCode
    FROM members
    WHERE memberCode LIKE ?
  `;
  const queryParams = [`${codePrefix}${currentYear}%`];

  try {
    const results = await queryDatabase(query, queryParams);
    const maxCode = results[0]?.maxCode;
    const nextNumber = maxCode ? parseInt(maxCode, 10) + 1 : 1;
    const numericPart = String(nextNumber).padStart(4, '0');

    const newMemberCode = `${currentYear}${numericPart}`;

    return { memberCode: newMemberCode, memberType };
  } catch (error) {
    console.error('Error generating unique member code:', error);
    throw new Error('Error generating unique member code');
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
