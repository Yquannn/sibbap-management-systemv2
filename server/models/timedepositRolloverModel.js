const db = require('../config/db');
const { generateRolloverTransactionNumber } = require('../utils/generateTransactionNumber');

const Rollover = {
  create: async (rolloverData) => {
    // 1. Generate a unique transaction number for this rollover
    const rollover_transaction_number = await generateRolloverTransactionNumber();

    // 2. Merge it into the data we’re about to persist
    const dataToInsert = {
      ...rolloverData,
      rollover_transaction_number,
    };

    // 3. Insert into DB
    const [result] = await db.query(
      'INSERT INTO time_deposit_rollovers SET ?',
      [dataToInsert]
    );

    // 4. Return everything, including the generated ID and txn number
    return {
      rollover_id: result.insertId,
      rollover_transaction_number,
      ...rolloverData,
    };
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
