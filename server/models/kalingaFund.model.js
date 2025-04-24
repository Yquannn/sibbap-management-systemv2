// models/kalingaFund.model.js
const db = require('../config/db');

class KalingaFundSettings {
  static async getAll() {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_fund_settings');
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async getActive() {
    try {
      const [results] = await db.query('SELECT * FROM kalinga_fund_settings WHERE is_active = true');
      return results[0]; // Return the first active setting
    } catch (err) {
      throw err;
    }
  }
  
  static async create(settings) {
    try {
      // If you want to deactivate all other settings first
      await db.query('UPDATE kalinga_fund_settings SET is_active = false');
      
      // Insert new settings
      const [result] = await db.query('INSERT INTO kalinga_fund_settings SET ?', [settings]);
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }
  
  static async update(fundId, settings) {
    try {
      const [result] = await db.query(
        'UPDATE kalinga_fund_settings SET ? WHERE fund_id = ?', 
        [settings, fundId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = KalingaFundSettings;