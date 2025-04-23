const db = require('../config/db');

// Base queries from your original code
const getTotalRegularSavings = async () => {
  const query = "SELECT IFNULL(SUM(amount), 0) AS total FROM regular_savings";
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalDeposits = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Deposit'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalWithdrawals = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Withdrawal'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalDisbursementSavings = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM regular_savings_transaction 
    WHERE transaction_type = 'Disbursement'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalShareCapital = async () => {
  const query = `
    SELECT IFNULL(SUM(share_capital), 0) AS total 
    FROM members
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalTimedeposit = async () => {
  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total 
    FROM time_deposit
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getPartialMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members 
    WHERE member_type = 'Partial Member'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getRegularMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members 
    WHERE member_type = 'Regular Member'
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

const getTotalMembersCount = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM members
  `;
  const [rows] = await db.execute(query);
  return rows[0];
};

// New queries for enhanced functionality
const getTimeDepositAnalytics = async () => {
  const query = `
    SELECT 
      fixedTerm,
      COUNT(*) as count,
      SUM(amount) as total_amount,
      AVG(amount) as avg_amount
    FROM time_deposit
    GROUP BY fixedTerm
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getShareCapitalTrends = async () => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      SUM(total_amount) as amount,
      COUNT(*) as contributor_count
    FROM share_capital
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `;
  const [rows] = await db.execute(query);
  return rows;
};


const getShareCapitalAnalytics = async () => {
  const queries = {
    // Monthly trend analysis
    monthlyTrends: `
      SELECT 
        DATE_FORMAT(registration_date, '%Y-%m') as month,
        SUM(share_capital) as total_share_capital,
        COUNT(*) as member_count,
        AVG(share_capital) as average_share_capital
      FROM members
      WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
      ORDER BY month ASC
    `,

    // Share capital distribution ranges
    distribution: `
      SELECT 
        CASE 
          WHEN share_capital <= 1000 THEN '0-1000'
          WHEN share_capital <= 5000 THEN '1001-5000'
          WHEN share_capital <= 10000 THEN '5001-10000'
          WHEN share_capital <= 50000 THEN '10001-50000'
          ELSE '50000+'
        END as \`range\`,
        COUNT(*) as member_count,
        SUM(share_capital) as total_amount
      FROM members
      GROUP BY \`range\`
      ORDER BY FIELD(\`range\`, '0-1000', '1001-5000', '5001-10000', '10001-50000', '50000+')
    `,

    // Year-over-year comparison
    yearlyComparison: `
      SELECT 
        YEAR(registration_date) as year,
        SUM(share_capital) as total_share_capital,
        COUNT(*) as new_members,
        AVG(share_capital) as avg_share_capital
      FROM members
      WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 2 YEAR)
      GROUP BY YEAR(registration_date)
      ORDER BY year DESC
    `,

    // Member type share capital analysis
    memberTypeAnalysis: `
      SELECT 
        member_type,
        COUNT(*) as member_count,
        SUM(share_capital) as total_share_capital,
        AVG(share_capital) as avg_share_capital,
        MIN(share_capital) as min_share_capital,
        MAX(share_capital) as max_share_capital
      FROM members
      GROUP BY member_type
    `
  };

  try {
    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const [rows] = await db.execute(query);
      results[key] = rows;
    }
    return results;
  } catch (error) {
    console.error('Error in getShareCapitalAnalytics:', error);
    throw error;
  }
};

const getTimeDepositMaturityTimeline = async () => {
  const query = `
    SELECT 
      DATE_FORMAT(maturityDate, '%Y-%m') as month,
      COUNT(*) as count,
      SUM(amount) as total_amount
    FROM time_deposit
    WHERE maturityDate >= NOW()
    GROUP BY DATE_FORMAT(maturityDate, '%Y-%m')
    ORDER BY month ASC
    LIMIT 9
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getSavingsTransactionHistory = async () => {
  const query = `
    SELECT 
      DATE_FORMAT(transaction_date_time, '%Y-%m') as month,
      transaction_type,
      SUM(amount) as total_amount,
      COUNT(*) as transaction_count
    FROM regular_savings_transaction
    WHERE transaction_date_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(transaction_date_time, '%Y-%m'), transaction_type
    ORDER BY month ASC
  `;
  const [rows] = await db.execute(query);
  return rows;
};

const getMemberAgeDistribution = async () => {
  const query = `
    SELECT 
      CASE 
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35'
        WHEN age BETWEEN 36 AND 45 THEN '36-45'
        WHEN age BETWEEN 46 AND 55 THEN '46-55'
        WHEN age BETWEEN 56 AND 65 THEN '56-65'
        ELSE '65+'
      END as age_group,
      COUNT(*) as count
    FROM members
    GROUP BY age_group
    ORDER BY age_group
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Previous period comparisons
const getPreviousPeriodComparisons = async () => {
  const query = `
    SELECT
      (SELECT IFNULL(SUM(amount), 0) 
       FROM regular_savings_transaction 
       WHERE transaction_date_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_savings,
      (SELECT IFNULL(SUM(amount), 0) 
       FROM regular_savings_transaction 
       WHERE transaction_date_time BETWEEN DATE_SUB(NOW(), INTERVAL 2 MONTH) AND DATE_SUB(NOW(), INTERVAL 1 MONTH)) as previous_month_savings,
      (SELECT COUNT(*) 
       FROM members 
       WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_members,
      (SELECT COUNT(*) 
       FROM members 
       WHERE registration_date BETWEEN DATE_SUB(NOW(), INTERVAL 2 MONTH) AND DATE_SUB(NOW(), INTERVAL 1 MONTH)) as previous_month_members
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
  getTimeDepositAnalytics,
  getShareCapitalTrends,
  getTimeDepositMaturityTimeline,
  getSavingsTransactionHistory,
  getMemberAgeDistribution,
  getPreviousPeriodComparisons,
  getShareCapitalAnalytics
};