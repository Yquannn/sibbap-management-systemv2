const db = require('../config/db');

// Get count of disbursed loans
const getTotalDisbuirse = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM loan_applications
    WHERE remarks = "Disbursed" 
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get count of pending loans
const getTotalPending = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM loan_applications
    WHERE status = "Waiting for Approval" 
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get count of approved loans
const getTotalLoanApprove = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM loan_applications WHERE status = "Approved"
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total count of loan applications
const getTotalLoanApplication = async () => {
  const query = "SELECT COUNT(*) AS total FROM loan_applications";
  const [rows] = await db.execute(query);
  return rows[0]; // Returns the object with `total`
};

// Get total amount of disbursed loans
const getTotalLoanDisbursed = async () => {
  const query = `
    SELECT IFNULL(SUM(loan_amount), 0) AS total 
    FROM loan_applications 
    WHERE remarks = 'Disbursed' 
  `;
  const [rows] = await db.execute(query);
  return rows[0]; // { total: ... }
};

// Get total amount of approved loans
const getTotalLoanAmountApproved = async () => {
  const query = `
    SELECT IFNULL(SUM(loan_amount), 0) AS total 
    FROM loan_applications 
    WHERE status = 'Approved' 
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get rejected loan applications
const getTotalRejected = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM loan_applications
    WHERE status = "Rejected" 
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get average loan amount
const getAverageLoanAmount = async () => {
  const query = `
    SELECT IFNULL(AVG(loan_amount), 0) AS average 
    FROM loan_applications
    WHERE status = "Approved" OR remarks = "Disbursed"
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get loan applications by type
const getLoanCountByType = async () => {
  const query = `
    SELECT loan_type, COUNT(*) AS count 
    FROM loan_applications
    GROUP BY loan_type
    ORDER BY count DESC
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Get monthly loan statistics for current year
const getMonthlyLoanStats = async () => {
  const query = `
    SELECT 
      MONTH(created_at) AS month,
      COUNT(*) AS total_applications,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN remarks = 'Disbursed' THEN 1 ELSE 0 END) AS disbursed,
      IFNULL(SUM(CASE WHEN remarks = 'Disbursed' THEN loan_amount ELSE 0 END), 0) AS disbursed_amount
    FROM loan_applications
    WHERE YEAR(created_at) = YEAR(CURDATE())
    GROUP BY MONTH(created_at)
    ORDER BY month
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Get overdue loans (based on terms and still has balance)
const getOverdueLoanCount = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM loan_applications
    WHERE remarks = 'Disbursed'
    AND loan_status = 'Active'
    AND DATEDIFF(CURDATE(), DATE_ADD(created_at, INTERVAL terms MONTH)) > 0
    AND balance > 0
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get loan repayment rate - comparing fully paid loans vs loans due
const getLoanRepaymentRate = async () => {
  const query = `
    SELECT 
      COUNT(CASE WHEN balance = 0 THEN 1 END) AS fully_paid,
      COUNT(*) AS total_loans,
      IFNULL(ROUND((COUNT(CASE WHEN balance = 0 THEN 1 END) / COUNT(*)) * 100, 2), 0) AS repayment_rate
    FROM loan_applications
    WHERE remarks = 'Disbursed'
    AND DATEDIFF(CURDATE(), created_at) > 30
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get average interest rate
const getAverageInterestRate = async () => {
  const query = `
    SELECT IFNULL(AVG(interest), 0) AS average_interest
    FROM loan_applications
    WHERE status = 'Approved' OR remarks = 'Disbursed'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get total service fees collected
const getTotalServiceFees = async () => {
  const query = `
    SELECT IFNULL(SUM(service_fee), 0) AS total_fees
    FROM loan_applications
    WHERE remarks = 'Disbursed'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// Get loan term distribution
const getLoanTermDistribution = async () => {
  const query = `
    SELECT 
      terms, 
      COUNT(*) AS count 
    FROM loan_applications
    WHERE status = 'Approved' OR remarks = 'Disbursed'
    GROUP BY terms
    ORDER BY terms
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Get top borrowers
const getTopBorrowers = async (limit = 10) => {
  const query = `
    SELECT 
      memberId, 
      COUNT(*) AS loan_count,
      IFNULL(SUM(loan_amount), 0) AS total_borrowed
    FROM loan_applications
    WHERE remarks = 'Disbursed'
    GROUP BY memberId
    ORDER BY total_borrowed DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(query, [limit]);
  return rows;
};

// Get total outstanding loan balances
const getTotalOutstandingBalance = async () => {
  const query = `
    SELECT IFNULL(SUM(balance), 0) AS total_outstanding
    FROM loan_applications
    WHERE loan_status = 'Active'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

module.exports = {
  getTotalLoanApplication,
  getTotalLoanApprove,
  getTotalPending,
  getTotalDisbuirse,
  getTotalLoanDisbursed,
  getTotalLoanAmountApproved,
  getTotalRejected,
  getAverageLoanAmount,
  getLoanCountByType,
  getMonthlyLoanStats,
  getOverdueLoanCount,
  getLoanRepaymentRate,
  getAverageInterestRate,
  getTotalServiceFees,
  getLoanTermDistribution,
  getTopBorrowers,
  getTotalOutstandingBalance
};