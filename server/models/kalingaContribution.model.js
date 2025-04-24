// models/kalingaContribution.model.js
const db = require('../config/db');

class KalingaContributions {
  static async getAll() {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_contributions');
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async getByMember(memberId) {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_contributions WHERE memberId = ?', [memberId]);
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async create(contribution) {
    try {
      const [result] = await db.query('INSERT INTO kalinga_contributions SET ?', [contribution]);
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }
  
  static async getById(contributionId) {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_contributions WHERE contribution_id = ?', [contributionId]);
      return results[0];
    } catch (err) {
      throw err;
    }
  }
}

module.exports = KalingaContributions;