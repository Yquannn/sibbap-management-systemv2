// models/kalingaClaims.model.js
const db = require('../config/db');

class KalingaClaims {
  static async getAll() {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_claims');
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async getByMember(memberId) {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_claims WHERE member_id = ?', [memberId]);
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async getByStatus(status) {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_claims WHERE status = ?', [status]);
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async create(claim) {
    try {
      const [result] = await db.query('INSERT INTO kalinga_claims SET ?', [claim]);
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }
  
// First fix the model function
static async updateStatus(claimId, status, approvedBy, approvedDate) {
  try {
    // Verify approver exists in users table first
    const [userCheck] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [approvedBy]
    );
    
    if (userCheck.length === 0) {
      throw new Error('Approver user ID does not exist');
    }
    
    const [result] = await db.query(
      'UPDATE kalinga_claims SET status = ?, approved_by = ?, approved_date = ? WHERE claim_id = ?',
      [status, approvedBy, approvedDate, claimId]
    );
    return result.affectedRows > 0;
  } catch (err) {
    throw err;
  }
}

  
  static async getById(claimId) {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_claims WHERE claim_id = ?', [claimId]);
      return results[0];
    } catch (err) {
      throw err;
    }
  }
}

module.exports = KalingaClaims;