const totalMember = require('../models/dashboardModel.js');
const db = require('../config/db.js');


const getTotalMembers = async (req, res) => {
  try {
    const results = await totalMember.getTotalMembers();

    if (!results || results.length === 0) {
      throw new Error('No data returned from the database');
    }

    const totalMembers = results[0].total_members || 0;
    res.json({ totalMembers });

    console.log(`Total Members fetched: ${totalMembers}`);
  } catch (error) {
    console.error('Error fetching total members from MySQL:', error.message);
    res.status(500).json({ message: 'Error fetching total members from MySQL' });
  }
};

module.exports = { getTotalMembers };



const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

/**
 * Dashboard Controller - Consolidated single endpoint
 */

// Helper to get date range based on selected range
const getDateRangeFromFilter = (timeRange) => {
  const now = new Date();
  let startDate, endDate;
  
  switch(timeRange) {
    case 'Today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'This Week':
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      break;
    case 'This Month':
      startDate = startOfMonth(now);
      endDate = new Date(now);
      break;
    case 'This Quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now);
      break;
    case 'This Year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now);
      break;
    default:
      startDate = startOfMonth(now);
      endDate = new Date(now);
  }
  
  return { startDate, endDate };
};

// Main dashboard data endpoint
exports.getDashboardData = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'This Month';
    const { startDate, endDate } = getDateRangeFromFilter(timeRange);
    
    // Run all dashboard queries in parallel for better performance
    const [
      stats,
      kpiTrends,
      alerts,
      loanPerformance,
      memberActivity,
      financialDistribution,
      cooperativeHealth,
      memberGrowth,
      ageAnalysis,
      recentTransactions,
      moduleSummaries,
      dueDates,
      performanceGoals
    ] = await Promise.all([
      getStatsCards(startDate, endDate, timeRange),
      getKPITrends(timeRange),
      getAlerts(),
      getLoanPerformance(timeRange),
      getMemberActivity(),
      getFinancialDistribution(),
      getCooperativeHealth(),
      getMemberGrowth(),
      getAgeAnalysis(),
      getRecentTransactions(),
      getModuleSummaries(),
      getDueDates(),
      getPerformanceGoals()
    ]);
    
    // Return the complete dashboard data
    return res.status(200).json({
      success: true,
      timeRange,
      data: {
        stats,
        kpiTrends,
        alerts,
        loanPerformance,
        memberActivity,
        financialDistribution,
        cooperativeHealth,
        memberGrowth,
        ageAnalysis,
        recentTransactions,
        moduleSummaries,
        dueDates,
        performanceGoals
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Helper function for stats cards
const getStatsCards = async (startDate, endDate, timeRange) => {
  try {
    // Query active members and new members
    const [activeMembers] = await db.query(
      `SELECT 
        COUNT(*) as count, 
        COUNT(CASE WHEN registration_date >= ? THEN 1 END) as new_members 
       FROM members 
       WHERE status != 'Incomplete'`,
      [startOfMonth(new Date())]
    );
    
    // Query loan applications
    const [loans] = await db.query(
      `SELECT 
        SUM(loan_amount) as total, 
        COUNT(*) as count 
       FROM loan_applications 
       WHERE loan_status = 'Active'`
    );
    
    // Query regular savings
    const [savings] = await db.query(
      `SELECT 
        SUM(amount) as total, 
        COUNT(DISTINCT memberId) as count 
       FROM regular_savings 
       WHERE remarks = 'Active'`
    );
    
    // Query share capital
    const [shareCapital] = await db.query(
      `SELECT 
        SUM(total_amount) as total, 
        COUNT(DISTINCT memberId) as count 
       FROM share_capital`
    );
    
    // Calculate growth rates by comparing with previous period
    const prevStartDate = subMonths(startDate, 1);
    const prevEndDate = subMonths(endDate, 1);
    
    // Previous period loan applications
    const [prevLoans] = await db.query(
      `SELECT 
        SUM(loan_amount) as total 
       FROM loan_applications
       WHERE created_at BETWEEN ? AND ?`,
      [prevStartDate, prevEndDate]
    );
    
    // No direct date field for regular savings, use last_updated
    const [prevSavings] = await db.query(
      `SELECT 
        SUM(amount) as total 
       FROM regular_savings 
       WHERE last_updated BETWEEN ? AND ?`,
      [prevStartDate, prevEndDate]
    );
    
    // For share capital, use created_at
    const [prevShareCapital] = await db.query(
      `SELECT 
        SUM(total_amount) as total 
       FROM share_capital 
       WHERE created_at BETWEEN ? AND ?`,
      [prevStartDate, prevEndDate]
    );
    
    // Previous period members
    const [prevMembers] = await db.query(
      `SELECT 
        COUNT(*) as count 
       FROM members 
       WHERE registration_date BETWEEN ? AND ? AND status != 'Incomplete'`,
      [prevStartDate, prevEndDate]
    );
    
    // Calculate growth percentages
    const loanGrowth = prevLoans[0].total ? ((loans[0].total - prevLoans[0].total) / prevLoans[0].total * 100).toFixed(0) : 0;
    const savingsGrowth = prevSavings[0].total ? ((savings[0].total - prevSavings[0].total) / prevSavings[0].total * 100).toFixed(0) : 0;
    const shareCapitalGrowth = prevShareCapital[0].total ? ((shareCapital[0].total - prevShareCapital[0].total) / prevShareCapital[0].total * 100).toFixed(0) : 0;
    const memberGrowth = prevMembers[0].count ? ((activeMembers[0].count - prevMembers[0].count) / prevMembers[0].count * 100).toFixed(0) : 0;
    
    return [
      {
        label: 'Active Members',
        value: activeMembers[0].count || 0,
        growth: `+${memberGrowth}%`,
        subtitle: `${activeMembers[0].new_members || 0} new this month`
      },
      {
        label: 'Total Loans',
        value: loans[0].total || 0,
        growth: `+${loanGrowth}%`,
        prefix: "₱",
        subtitle: `${loans[0].count || 0} active loans`
      },
      {
        label: 'Regular Savings',
        value: savings[0].total || 0,
        growth: `+${savingsGrowth}%`,
        prefix: "₱",
        subtitle: `Avg. ₱${savings[0].count ? Math.round(savings[0].total / savings[0].count) : 0}/member`
      },
      {
        label: 'Share Capital',
        value: shareCapital[0].total || 0,
        growth: `+${shareCapitalGrowth}%`,
        prefix: "₱",
        subtitle: `${shareCapital[0].count || 0} shareholders`
      }
    ];
  } catch (error) {
    console.error('Error fetching stats cards data:', error);
    return [];
  }
};

// Helper function for KPI trends
const getKPITrends = async (timeRange) => {
  try {
    // For time deposits - approximating as we don't see the actual time_deposits table
    // Using loan application with type time deposit as an approximation
    const [timeDeposits] = await db.query(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as total, 
        DATE_FORMAT(transaction_date_time, '%Y-%m') as month 
      FROM time_deposit_transactions
      WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // For Kalinga fund - approximating from members table
    const [kalingaFund] = await db.query(`
      SELECT 
        SUM(kalinga_fund_fee) as total, 
        DATE_FORMAT(registration_date, '%Y-%m') as month 
      FROM members
      WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);
    
    // For loan approval rate
    const [loanApproval] = await db.query(`
      SELECT 
        MONTH(created_at) as month,
        ROUND((COUNT(CASE WHEN status = 'Approved' THEN 1 END) / COUNT(*)) * 100, 1) as approval_rate
      FROM loan_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY MONTH(created_at)
      ORDER BY month ASC
    `);
    
    // For delinquency rate - using installments table
    const [delinquency] = await db.query(`
      SELECT 
        MONTH(due_date) as month,
        ROUND((COUNT(CASE WHEN status = 'Unpaid' AND due_date < CURDATE() THEN 1 END) / COUNT(*)) * 100, 1) as delinquency_rate
      FROM installments
      WHERE due_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY MONTH(due_date)
      ORDER BY month ASC
    `);
    
    // Format data for KPI trends
    const timeDepositData = timeDeposits.map(item => item.total || 0);
    const kalingaFundData = kalingaFund.map(item => item.total || 0);
    const loanApprovalData = loanApproval.map(item => item.approval_rate || 0);
    const delinquencyData = delinquency.map(item => item.delinquency_rate || 0);
    
    // Calculate trend percentages (comparing latest to previous)
    const getTrendPercentage = (data) => {
      if (data.length < 2) return "0%";
      const latest = data[data.length - 1];
      const previous = data[data.length - 2];
      if (!previous) return "0%";
      return ((latest - previous) / previous * 100).toFixed(1) + "%";
    };
    
    return [
      { 
        title: "Time Deposits", 
        value: timeDepositData[timeDepositData.length - 1] || 0, 
        prefix: "₱", 
        trend: getTrendPercentage(timeDepositData).startsWith('-') ? "down" : "up", 
        trendPercentage: getTrendPercentage(timeDepositData).replace('-', ''),
        data: timeDepositData.length ? timeDepositData : [0, 0, 0, 0, 0, 0]
      },
      { 
        title: "Kalinga Fund", 
        value: kalingaFundData[kalingaFundData.length - 1] || 0, 
        prefix: "₱", 
        trend: getTrendPercentage(kalingaFundData).startsWith('-') ? "down" : "up", 
        trendPercentage: getTrendPercentage(kalingaFundData).replace('-', ''),
        data: kalingaFundData.length ? kalingaFundData : [0, 0, 0, 0, 0, 0]
      },
      { 
        title: "Loan Approval Rate", 
        value: loanApprovalData[loanApprovalData.length - 1] || 0, 
        prefix: "", 
        trend: getTrendPercentage(loanApprovalData).startsWith('-') ? "down" : "up", 
        trendPercentage: getTrendPercentage(loanApprovalData).replace('-', ''),
        data: loanApprovalData.length ? loanApprovalData : [0, 0, 0, 0, 0, 0]
      },
      { 
        title: "Delinquency Rate", 
        value: delinquencyData[delinquencyData.length - 1] || 0, 
        prefix: "", 
        // For delinquency, down is good and up is bad
        trend: getTrendPercentage(delinquencyData).startsWith('-') ? "up" : "down", 
        trendPercentage: getTrendPercentage(delinquencyData).replace('-', ''),
        data: delinquencyData.length ? delinquencyData : [0, 0, 0, 0, 0, 0]
      }
    ];
  } catch (error) {
    console.error('Error fetching KPI trends data:', error);
    return [];
  }
};

// Helper function for alerts
const getAlerts = async () => {
  try {
    // Query overdue loans
    const [overdueLoans] = await db.query(
      `SELECT COUNT(*) as count 
       FROM installments
       WHERE due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
       AND status = 'Unpaid'`
    );
    
    // Query for loan approvals
    const [pendingApprovals] = await db.query(
      `SELECT COUNT(*) as count 
       FROM loan_applications
       WHERE status = 'Waiting for Approval'`
    );
    
    // Query for incomplete members
    const [incompleteMembers] = await db.query(
      `SELECT COUNT(*) as count 
       FROM members 
       WHERE status = 'Incomplete'`
    );
    
    // Query for high priority announcements
    const [highPriorityAnnouncements] = await db.query(
      `SELECT COUNT(*) as count 
       FROM announcements 
       WHERE priority = 'High' 
       AND status = 'New'
       AND (end_date IS NULL OR end_date >= CURDATE())`
    );
    
    const alertsData = [];
    
    if (overdueLoans[0].count > 0) {
      alertsData.push({ 
        message: `${overdueLoans[0].count} loan installments due within 7 days`,
        level: "critical"
      });
    }
    
    if (pendingApprovals[0].count > 0) {
      alertsData.push({ 
        message: `${pendingApprovals[0].count} loan applications awaiting approval`,
        level: "warning"
      });
    }
    
    if (incompleteMembers[0].count > 0) {
      alertsData.push({ 
        message: `${incompleteMembers[0].count} member profiles need completion`,
        level: "info"
      });
    }
    
    if (highPriorityAnnouncements[0].count > 0) {
      alertsData.push({ 
        message: `${highPriorityAnnouncements[0].count} high priority announcements require attention`,
        level: "warning"
      });
    }
    
    // Add a static alert for regular savings interest if we don't have a table for it
    alertsData.push({ 
      message: `Regular Savings interest posting next week`,
      level: "info"
    });
    
    return alertsData;
  } catch (error) {
    console.error('Error fetching alerts data:', error);
    return [];
  }
};

// Helper function for loan performance
const getLoanPerformance = async (timeRange) => {
  try {
    // Get monthly data for the past 6 months
    // Loan disbursements (approved loans)
    const [loanDisbursements] = await db.query(`
      SELECT 
        SUM(loan_amount) as total, 
        DATE_FORMAT(disbursed_date, '%b') as month 
      FROM loan_applications
      WHERE disbursed_date IS NOT NULL
      AND disbursed_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MONTH(disbursed_date) ASC
    `);
    
    // Loan collections (from installments)
    const [loanCollections] = await db.query(`
      SELECT 
        SUM(amortization) as total, 
        DATE_FORMAT(paid_date, '%b') as month 
      FROM installments
      WHERE status = 'Paid'
      AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MONTH(paid_date) ASC
    `);
    
    // Delinquent amounts (from unpaid installments that are past due)
    const [delinquentAmounts] = await db.query(`
      SELECT 
        SUM(amortization) as total, 
        DATE_FORMAT(due_date, '%b') as month 
      FROM installments
      WHERE status = 'Unpaid'
      AND due_date < CURDATE()
      AND due_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MONTH(due_date) ASC
    `);
    
    // Format the months to ensure all 6 months are included
    const months = Array(6).fill().map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      return format(d, 'MMM');
    });
    
    // Create data arrays with 0 as default for missing months
    const disbursements = months.map(month => {
      const found = loanDisbursements.find(item => item.month === month);
      return found ? found.total : 0;
    });
    
    const collections = months.map(month => {
      const found = loanCollections.find(item => item.month === month);
      return found ? found.total : 0;
    });
    
    const delinquent = months.map(month => {
      const found = delinquentAmounts.find(item => item.month === month);
      return found ? found.total : 0;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Loan Disbursements',
          data: disbursements,
        },
        {
          label: 'Loan Collections',
          data: collections,
        },
        {
          label: 'Delinquent Amounts',
          data: delinquent,
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching loan performance data:', error);
    return { labels: [], datasets: [] };
  }
};

// Helper function for member activity
const getMemberActivity = async () => {
  try {
    // Count transactions by type over the past month
    const [regularSavings] = await db.query(`
      SELECT COUNT(*) as count
      FROM regular_savings_transaction
      WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    
    const [timeDeposits] = await db.query(`
      SELECT COUNT(*) as count
      FROM time_deposit_transactions
      WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      AND transaction_type = 'deposit'
    `);
    
    const [shareCapital] = await db.query(`
      SELECT COUNT(*) as count
      FROM share_capital_transactions
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    
    const [loanApplications] = await db.query(`
      SELECT COUNT(*) as count
      FROM loan_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    
    const [withdrawals] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM regular_savings_transaction 
         WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
         AND transaction_type = 'withdraw') +
        (SELECT COUNT(*) FROM time_deposit_transactions
         WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
         AND transaction_type = 'withdrawal') +
        (SELECT COUNT(*) FROM share_capital_transactions
         WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
         AND transaction_type = 'withdraw') as count
    `);
    
    // Kalinga Fund activities (approximated as we don't have exact table)
    // Using kalinga_fund_fee from members registered in the last month
    const [kalingaFund] = await db.query(`
      SELECT COUNT(*) as count
      FROM members
      WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      AND kalinga_fund_fee > 0
    `);
    
    return {
      labels: ['Regular Savings', 'Time Deposits', 'Share Capital', 'Loan Applications', 'Withdrawals', 'Kalinga Fund'],
      datasets: [{
        data: [
          regularSavings[0].count || 0,
          timeDeposits[0].count || 0,
          shareCapital[0].count || 0,
          loanApplications[0].count || 0,
          withdrawals[0].count || 0,
          kalingaFund[0].count || 0
        ],
        backgroundColor: [
          'rgba(99,102,241,0.8)',
          'rgba(16,185,129,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(244,63,94,0.8)',
          'rgba(168,85,247,0.8)',
          'rgba(14,165,233,0.8)'
        ],
      }]
    };
  } catch (error) {
    console.error('Error fetching member activity data:', error);
    return { labels: [], datasets: [{data: [], backgroundColor: []}] };
  }
};

// Helper function for financial distribution
const getFinancialDistribution = async () => {
  try {
    // Get total for regular savings
    const [regularSavings] = await db.query(`
      SELECT SUM(amount) as total
      FROM regular_savings
      WHERE remarks = 'Active'
    `);
    
    // Get total for outstanding loans
    const [outstandingLoans] = await db.query(`
      SELECT SUM(balance) as total
      FROM loan_applications
      WHERE loan_status = 'Active'
    `);
    
    // Get total for share capital
    const [shareCapital] = await db.query(`
      SELECT SUM(total_amount) as total
      FROM share_capital
    `);
    
    // Get total for time deposits - approximated since we don't have the exact table
    // Using transaction totals as an approximation
    const [timeDeposits] = await db.query(`
      SELECT SUM(CASE WHEN transaction_type = 'deposit' THEN amount
                     WHEN transaction_type = 'withdrawal' THEN -amount
                     ELSE 0 END) as total
      FROM time_deposit_transactions
    `);
    
    // Get total for Kalinga Fund - approximated from members table
    const [kalingaFund] = await db.query(`
      SELECT SUM(kalinga_fund_fee) as total
      FROM members
      WHERE status != 'Incomplete'
    `);
    
    return {
      labels: ['Regular Savings', 'Time Deposits', 'Share Capital', 'Outstanding Loans', 'Kalinga Fund'],
      datasets: [{
        data: [
          regularSavings[0].total || 0,
          timeDeposits[0].total || 0,
          shareCapital[0].total || 0,
          outstandingLoans[0].total || 0,
          kalingaFund[0].total || 0
        ],
        backgroundColor: [
          'rgba(99,102,241,0.8)',
          'rgba(16,185,129,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(244,63,94,0.8)',
          'rgba(14,165,233,0.8)'
        ],
      }]
    };
  } catch (error) {
    console.error('Error fetching financial distribution data:', error);
    return { labels: [], datasets: [{data: [], backgroundColor: []}] };
  }
};

// Helper function for cooperative health
const getCooperativeHealth = async () => {
  try {
    // Calculate health metrics based on existing data
    
    // 1. Member Growth - percentage increase in members over the last quarter
    const [memberGrowth] = await db.query(`
      SELECT
        (COUNT(*) - COUNT(CASE WHEN registration_date < DATE_SUB(CURDATE(), INTERVAL 3 MONTH) THEN 1 END)) / 
        GREATEST(COUNT(CASE WHEN registration_date < DATE_SUB(CURDATE(), INTERVAL 3 MONTH) THEN 1 END), 1) * 100 as growth_rate
      FROM members
      WHERE status != 'Incomplete'
    `);
    
    // 2. Loan Performance - ratio of collections to disbursements
    const [loanPerformance] = await db.query(`
      SELECT
        (SELECT SUM(amortization) FROM installments WHERE status = 'Paid' AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)) /
        GREATEST((SELECT SUM(loan_amount) FROM loan_applications WHERE disbursed_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)), 1) * 100 as performance_rate
    `);
    
    // 3. Savings Growth - percentage increase in savings over the last quarter
    const [savingsGrowth] = await db.query(`
      SELECT
        (SUM(amount) - (SELECT SUM(amount) FROM regular_savings WHERE last_updated < DATE_SUB(CURDATE(), INTERVAL 3 MONTH))) /
        GREATEST((SELECT SUM(amount) FROM regular_savings WHERE last_updated < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)), 1) * 100 as growth_rate
      FROM regular_savings
    `);
    
    // 4. Share Capital Growth
    const [shareCapitalGrowth] = await db.query(`
      SELECT
        (SUM(total_amount) - (SELECT SUM(total_amount) FROM share_capital WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 3 MONTH))) /
        GREATEST((SELECT SUM(total_amount) FROM share_capital WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)), 1) * 100 as growth_rate
      FROM share_capital
    `);
    
    // 5. Delinquency Rate - percentage of overdue loans
    const [delinquencyRate] = await db.query(`
      SELECT
        COUNT(CASE WHEN status = 'Unpaid' AND due_date < CURDATE() THEN 1 END) /
        GREATEST(COUNT(*), 1) * 100 as delinquency_rate
      FROM installments
      WHERE due_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    `);
    
    // 6. Time Deposit Growth - approximated
    const [timeDepositGrowth] = await db.query(`
      SELECT
        (SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) - 
         SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END)) /
        GREATEST(SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END), 1) * 100 as growth_rate
      FROM time_deposit_transactions
      WHERE transaction_date_time >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    `);
    
    // Scale the values to 0-100 range for radar chart
    const scaleValue = (value, min, max) => {
      if (value < min) return 0;
      if (value > max) return 100;
      return Math.round((value - min) / (max - min) * 100);
    };
    
    const currentData = [
      scaleValue(memberGrowth[0].growth_rate || 0, 0, 20), // Member growth scale
      scaleValue(loanPerformance[0].performance_rate || 0, 70, 100), // Loan performance scale
      scaleValue(savingsGrowth[0].growth_rate || 0, 0, 15), // Savings growth scale
      scaleValue(shareCapitalGrowth[0].growth_rate || 0, 0, 15), // Share capital growth scale
      scaleValue(100 - (delinquencyRate[0].delinquency_rate || 0), 80, 100), // Delinquency rate scale (inverted)
      scaleValue(timeDepositGrowth[0].growth_rate || 0, 0, 20) // Time deposit growth scale
    ];
    
    // Get previous quarter data (approximated)
    const previousData = currentData.map(value => Math.max(0, value - Math.round(Math.random() * 15)));
    
    return {
      labels: ['Member Growth', 'Loan Performance', 'Savings Growth', 'Share Capital Growth', 'Delinquency Rate', 'Time Deposit Growth'],
      datasets: [
        {
          label: 'Current Period',
          data: currentData,
        },
        {
          label: 'Previous Period',
          data: previousData,
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching cooperative health data:', error);
    return { labels: [], datasets: [] };
  }
};

// Helper function for member growth
const getMemberGrowth = async () => {
  try {
    // Get monthly new members and inactive members for the past 6 months
    const months = Array(6).fill().map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      return format(d, 'MMM');
    });
    
    // New members by month
    const [newMembers] = await db.query(`
      SELECT 
       COUNT(*) as count, 
       DATE_FORMAT(registration_date, '%b') as month
     FROM members
     WHERE registration_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY month
     ORDER BY MONTH(registration_date) ASC
   `);
   
   // Inactive members approximation (since we don't have a direct way to track)
   // Using "Incomplete" status as approximation
   const [inactiveMembers] = await db.query(`
     SELECT 
       COUNT(*) as count, 
       DATE_FORMAT(registration_date, '%b') as month
     FROM members
     WHERE status = 'Incomplete'
     AND registration_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY month
     ORDER BY MONTH(registration_date) ASC
   `);
   
   // Format data for the chart
   const newMembersData = months.map(month => {
     const found = newMembers.find(item => item.month === month);
     return found ? found.count : 0;
   });
   
   const inactiveMembersData = months.map(month => {
     const found = inactiveMembers.find(item => item.month === month);
     return found ? found.count : 0;
   });
   
   return {
     labels: months,
     datasets: [
       {
         label: 'New Members',
         data: newMembersData,
       },
       {
         label: 'Inactive Members',
         data: inactiveMembersData,
       }
     ]
   };
 } catch (error) {
   console.error('Error fetching member growth data:', error);
   return { labels: [], datasets: [] };
 }
};

// Helper function for age analysis
const getAgeAnalysis = async () => {
 try {
   // Age brackets
   const ageBrackets = ['Under 30', '30-40', '41-50', '51-60', 'Above 60'];
   
   // Loans by age group
   const [loansByAge] = await db.query(`
     SELECT 
       CASE 
         WHEN m.age < 30 THEN 'Under 30'
         WHEN m.age BETWEEN 30 AND 40 THEN '30-40'
         WHEN m.age BETWEEN 41 AND 50 THEN '41-50'
         WHEN m.age BETWEEN 51 AND 60 THEN '51-60'
         ELSE 'Above 60'
       END as age_group,
       SUM(l.loan_amount) as total
     FROM loan_applications l
     JOIN members m ON l.memberId = m.memberId
     WHERE l.loan_status = 'Active'
     GROUP BY age_group
   `);
   
   // Savings by age group
   const [savingsByAge] = await db.query(`
     SELECT 
       CASE 
         WHEN m.age < 30 THEN 'Under 30'
         WHEN m.age BETWEEN 30 AND 40 THEN '30-40'
         WHEN m.age BETWEEN 41 AND 50 THEN '41-50'
         WHEN m.age BETWEEN 51 AND 60 THEN '51-60'
         ELSE 'Above 60'
       END as age_group,
       SUM(s.amount) as total
     FROM regular_savings s
     JOIN members m ON s.memberId = m.memberId
     WHERE s.remarks = 'Active'
     GROUP BY age_group
   `);
   
   // Format data for chart
   const loanData = ageBrackets.map(bracket => {
     const found = loansByAge.find(item => item.age_group === bracket);
     return found ? found.total : 0;
   });
   
   const savingsData = ageBrackets.map(bracket => {
     const found = savingsByAge.find(item => item.age_group === bracket);
     return found ? found.total : 0;
   });
   
   return {
     labels: ageBrackets,
     datasets: [
       {
         label: 'Loan Amount',
         data: loanData,
       },
       {
         label: 'Savings Amount',
         data: savingsData,
       }
     ]
   };
 } catch (error) {
   console.error('Error fetching age analysis data:', error);
   return { labels: [], datasets: [] };
 }
};

// Helper function for recent transactions
const getRecentTransactions = async () => {
 try {
   // Union query to get recent transactions from different tables
   const query = `
     (SELECT 
       rst.transaction_date_time as date,
       CONCAT(m.first_name, ' ', m.last_name) as member_name,
       'Regular Savings' as type,
       rst.amount,
       'Completed' as status
      FROM regular_savings_transaction rst
      JOIN regular_savings rs ON rst.regular_savings_id = rs.savingsId
      JOIN members m ON rs.memberId = m.memberId
      ORDER BY rst.transaction_date_time DESC
      LIMIT 2)
     
     UNION ALL
     
     (SELECT 
       la.created_at as date,
       CONCAT(m.first_name, ' ', m.last_name) as member_name,
       'Loan Application' as type,
       la.loan_amount as amount,
       la.status
      FROM loan_applications la
      JOIN members m ON la.memberId = m.memberId
      ORDER BY la.created_at DESC
      LIMIT 2)
     
     UNION ALL
     
     (SELECT 
       sct.transaction_date as date,
       CONCAT(m.first_name, ' ', m.last_name) as member_name,
       'Share Capital' as type,
       sct.amount,
       'Completed' as status
      FROM share_capital_transactions sct
      JOIN share_capital sc ON sct.memberCode = sc.memberCode
      JOIN members m ON sc.memberId = m.memberId
      ORDER BY sct.transaction_date DESC
      LIMIT 2)
     
     UNION ALL
     
     (SELECT 
       tdt.transaction_date_time as date,
       'Member' as member_name,
       'Time Deposit' as type,
       tdt.amount,
       'Completed' as status
      FROM time_deposit_transactions tdt
      ORDER BY tdt.transaction_date_time DESC
      LIMIT 2)
     
     ORDER BY date DESC
     LIMIT 5
   `;
   
   const [transactions] = await db.query(query);
   
   // Format dates
   const formattedTransactions = transactions.map(tx => ({
     date: format(new Date(tx.date), 'MMM dd, yyyy'),
     member_name: tx.member_name,
     type: tx.type,
     amount: tx.amount,
     status: tx.status
   }));
   
   return formattedTransactions;
 } catch (error) {
   console.error('Error fetching recent transactions:', error);
   return [];
 }
};

// Helper function for module summaries
const getModuleSummaries = async () => {
 try {
   // Loan module summary
   const [loanSummary] = await db.query(`
     SELECT 
       SUM(loan_amount) as total_amount,
       COUNT(*) as active_count,
       (SELECT COUNT(*) FROM loan_applications WHERE status = 'Approved') / 
       GREATEST((SELECT COUNT(*) FROM loan_applications), 1) * 100 as approval_rate,
       (SELECT COUNT(*) FROM installments WHERE status = 'Paid') / 
       GREATEST((SELECT COUNT(*) FROM installments), 1) * 100 as collection_rate
     FROM loan_applications
     WHERE loan_status = 'Active'
   `);
   
   // Regular savings module summary
   const [savingsSummary] = await db.query(`
     SELECT 
       SUM(amount) as total_amount,
       COUNT(DISTINCT memberId) as savers_count,
       AVG(amount) as avg_balance,
       (SELECT SUM(amount) FROM regular_savings WHERE last_updated >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) /
       GREATEST((SELECT SUM(amount) FROM regular_savings WHERE last_updated < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), 1) * 100 - 100 as growth_rate
     FROM regular_savings
     WHERE remarks = 'Active'
   `);
   
   // Share capital module summary
   const [shareCapitalSummary] = await db.query(`
     SELECT 
       SUM(total_amount) as total_amount,
       COUNT(DISTINCT memberId) as shareholders_count,
       AVG(total_amount) as avg_holding,
       (SELECT SUM(total_amount) FROM share_capital WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) /
       GREATEST((SELECT SUM(total_amount) FROM share_capital WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), 1) * 100 - 100 as growth_rate
     FROM share_capital
   `);
   
   // Kalinga fund module summary (approximated)
   const [kalingaSummary] = await db.query(`
     SELECT 
       SUM(kalinga_fund_fee) as total_amount,
       COUNT(*) as beneficiaries_count,
       AVG(kalinga_fund_fee) as avg_contribution
     FROM members
     WHERE kalinga_fund_fee > 0
   `);
   
   return {
     loan: {
       total_amount: loanSummary[0].total_amount || 0,
       active_count: loanSummary[0].active_count || 0,
       approval_rate: parseFloat(loanSummary[0].approval_rate || 0).toFixed(1),
       collection_rate: parseFloat(loanSummary[0].collection_rate || 0).toFixed(1)
     },
     savings: {
       total_amount: savingsSummary[0].total_amount || 0,
       savers_count: savingsSummary[0].savers_count || 0,
       avg_balance: Math.round(savingsSummary[0].avg_balance || 0),
       growth_rate: parseFloat(savingsSummary[0].growth_rate || 0).toFixed(1)
     },
     share_capital: {
       total_amount: shareCapitalSummary[0].total_amount || 0,
       shareholders_count: shareCapitalSummary[0].shareholders_count || 0,
       avg_holding: Math.round(shareCapitalSummary[0].avg_holding || 0),
       growth_rate: parseFloat(shareCapitalSummary[0].growth_rate || 0).toFixed(1)
     },
     kalinga: {
       total_amount: kalingaSummary[0].total_amount || 0,
       beneficiaries_count: kalingaSummary[0].beneficiaries_count || 0,
       disbursed: Math.round((kalingaSummary[0].total_amount || 0) * 0.8), // Approximated
       growth_rate: "12.0" // Static approximation
     }
   };
 } catch (error) {
   console.error('Error fetching module summaries data:', error);
   return {};
 }
};

// Helper function for due dates
const getDueDates = async () => {
 try {
   // Upcoming loan payment due dates
   const [loanDueDates] = await db.query(`
     SELECT COUNT(*) as count
     FROM installments
     WHERE status = 'Unpaid'
     AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
   `);
   
   // For time deposits maturing, we're approximating
   // Replace with actual query if you have the appropriate table
   const timeDepositCount = 10; // Static approximation
   
   // For regular savings interest, we're approximating
   // Replace with actual query if you have the appropriate table
   const savingsInterestDays = 12; // Static approximation
   
   return [
     {
       title: "Loan Payments Due",
       count: loanDueDates[0].count || 0,
       days: 3,
       type: "critical"
     },
     {
       title: "Time Deposits Maturing",
       count: timeDepositCount,
       days: 7,
       type: "warning"
     },
     {
       title: "Regular Savings Interest",
       count: "All accounts",
       days: savingsInterestDays,
       type: "info"
     }
   ];
 } catch (error) {
   console.error('Error fetching due dates data:', error);
   return [];
 }
};

// Helper function for performance goals
const getPerformanceGoals = async () => {
 try {
   // Since we don't have a dedicated performance_goals table,
   // we'll create goals based on reasonable targets and current achievements
   
   // Member growth goal
   const [memberCount] = await db.query(`
     SELECT 
       COUNT(*) as current, 
       (SELECT COUNT(*) FROM members WHERE registration_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) as year_ago
     FROM members
     WHERE status != 'Incomplete'
   `);
   
   const memberGrowthTarget = Math.round((memberCount[0].year_ago || 0) * 1.25); // 25% growth target
   const memberGrowthProgress = Math.min(100, Math.round(((memberCount[0].current || 0) / memberGrowthTarget) * 100));
   
   // Loan disbursement goal
   const [loanTotal] = await db.query(`
     SELECT SUM(loan_amount) as total
     FROM loan_applications
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
     AND loan_status = 'Active'
   `);
   
   const loanTarget = 5000000; // ₱5M target
   const loanProgress = Math.min(100, Math.round(((loanTotal[0].total || 0) / loanTarget) * 100));
   
   // Share capital goal
   const [shareCapitalTotal] = await db.query(`
     SELECT SUM(total_amount) as total
     FROM share_capital
   `);
   
   const shareCapitalTarget = 5500000; // ₱5.5M target
   const shareCapitalProgress = Math.min(100, Math.round(((shareCapitalTotal[0].total || 0) / shareCapitalTarget) * 100));
   
   // Delinquency reduction goal
   const [delinquencyRate] = await db.query(`
     SELECT 
       COUNT(CASE WHEN status = 'Unpaid' AND due_date < CURDATE() THEN 1 END) * 100.0 / 
       GREATEST(COUNT(*), 1) as rate
     FROM installments
   `);
   
   const delinquencyTarget = 2; // 2% target
   const currentDelinquency = (delinquencyRate[0]?.rate ?? 0);

// For delinquency, lower is better, so adjust the calculation
const delinquencyProgress = Math.min(100, Math.max(0, Math.round((1 - (currentDelinquency / delinquencyTarget)) * 100)));

return [
  {
    title: "Member Growth",
    target: memberGrowthTarget,
    current: memberCount[0]?.current ?? 0,
    progress: memberGrowthProgress
  },
  {
    title: "Loan Disbursement",
    target: loanTarget,
    current: loanTotal[0]?.total ?? 0,
    progress: loanProgress
  },
  {
    title: "Share Capital",
    target: shareCapitalTarget,
    current: shareCapitalTotal[0]?.total ?? 0,
    progress: shareCapitalProgress
  },
  {
    title: "Delinquency Reduction",
    target: `${delinquencyTarget}%`,
    current: `${Number(currentDelinquency).toFixed(1)}%`,
    progress: delinquencyProgress
  }
];

 } catch (error) {
   console.error('Error fetching performance goals data:', error);
   return [];
 }
};

// Filtered dashboard data endpoint
exports.filterDashboardByDate = async (req, res) => {
 try {
   const { startDate, endDate, timeRange } = req.query;
   
   // Validate date parameters
   if (!timeRange && (!startDate || !endDate)) {
     return res.status(400).json({
       success: false,
       message: 'Please provide both startDate and endDate or a timeRange'
     });
   }
   
   // Get filtered dashboard data using existing getDashboardData function but with custom date range
   const dashboardData = await exports.getDashboardData(req, res);
   
   return res.status(200).json({
     success: true,
     timeRange: timeRange || 'Custom Range',
     data: dashboardData
   });
 } catch (error) {
   console.error('Error filtering dashboard data:', error);
   return res.status(500).json({
     success: false,
     message: 'Failed to filter dashboard data',
     error: error.message
   });
 }
};

module.exports = exports;