const db = require('../config/db');

const Rollover = {
  create: async (rolloverData) => {
    const [result] = await db.query(
      'INSERT INTO time_deposit_rollovers SET ?',
      [rolloverData]
    );
    return { rollover_id: result.insertId, ...rolloverData };
  },

  findById: async (rollover_id) => {
    const [rows] = await db.query(
      'SELECT * FROM time_deposit_rollovers WHERE rollover_id = ?',
      [rollover_id]
    );
    return rows[0];
  },

  findByTimeDepositId: async (timeDepositId) => {
    const [rows] = await db.query(
      'SELECT * FROM time_deposit_rollovers WHERE timeDepositId = ? ORDER BY created_at DESC',
      [timeDepositId]
    );
    return rows;
  },

  update: async (rollover_id, updateData) => {
    const [result] = await db.query(
      'UPDATE time_deposit_rollovers SET ? WHERE rollover_id = ?',
      [updateData, rollover_id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Rollover;