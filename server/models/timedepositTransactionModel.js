const db = require("../config/db");

async function getTransactionsByTimeDepositId(timeDepositId) {
  const query = `
    SELECT * FROM time_deposit_transactions
    WHERE time_deposit_id = ?
    ORDER BY transaction_date_time DESC
  `;
  const [rows] = await db.query(query, [timeDepositId]);
  return rows;
}

module.exports = {
  getTransactionsByTimeDepositId,
};
