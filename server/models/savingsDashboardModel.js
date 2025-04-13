const db = require('../config/db');

// Returns the total amount of regular savings
const getTotalRegularSavings = async () => {
  const query = "SELECT IFNULL(SUM(amount), 0) AS total FROM regular_savings";
  const [rows] = await db.execute(query);
  return rows[0]; // Returns the object with `total`
};

// Get total deposits amount
const getTotalDeposits = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Deposit'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total withdrawals amount
const getTotalWithdrawals = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Withdrawal'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total disbursement savings amount
const getTotalDisbursementSavings = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Disbursement'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total share capital
const getTotalShareCapital = async () => {
  const query = `
    SELECT IFNULL(SUM(share_capital), 0) AS total 
    FROM members
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total time deposit
const getTotalTimedeposit = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM time_deposit
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get count of partial members
const getPartialMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members 
    WHERE member_type = 'Partial Member'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get count of regular members
const getRegularMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members 
    WHERE member_type = 'Regular Member'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get the total count of members
const getTotalMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

module.exports = {
  getTotalRegularSavings,
  getTotalDeposits,
  getTotalWithdrawals,
  getTotalDisbursementSavings,
  getTotalShareCapital,
  getTotalTimedeposit,
  getPartialMembersCount,
  getRegularMembersCount,
  getTotalMembersCount,
};
