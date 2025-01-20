const db = require('../config/db');

/**
 * Find a savings record by memberId
 * @param {number} memberId - The ID of the member
 * @returns {object|null} - The savings record or null if not found
 */
const findSavingsByMemberId = async (memberId) => {
    if (!memberId) {
      throw new Error('Member ID is undefined or invalid');
    }
  
    const query = 'SELECT * FROM savings WHERE memberId = ?';
  
    try {
      const [rows] = await db.execute(query, [memberId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching savings record:', error.message);
      throw new Error('Database query failed');
    }
  };
  

/**
 * Update the savings amount by memberId
 * @param {number} memberId - The ID of the member
 * @param {number} newAmount - The new amount to set
 * @returns {boolean} - True if the record was updated, false otherwise
 */
const updateSavingsAmount = async (memberId, newAmount) => {
    const query = 'UPDATE savings SET amount = ? WHERE memberId = ?';
    try {
      const [result] = await db.execute(query, [newAmount, memberId]);
      return result.affectedRows > 0; // Return true if at least one row was updated
    } catch (error) {
      console.error('Error updating savings amount:', error.message);
      throw new Error('Database query failed');
    }
  };
  

/**
 * Create a new savings record
 * @param {number} memberId - The ID of the member
 * @param {number} [initialAmount=0] - The initial amount for the savings record
 * @returns {number} - The ID of the newly created record
 */


module.exports = {
  findSavingsByMemberId,
  updateSavingsAmount
};
