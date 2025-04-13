const loanDashboardModel = require('../models/loanDashboardModel');

// Get loan dashboard summary with expanded analytics
exports.getLoanDashboardSummary = async (req, res) => {
  try {
    // Fetch all totals using the loan model functions
    const totalLoanApplications = await loanDashboardModel.getTotalLoanApplication();
    const totalApproved = await loanDashboardModel.getTotalLoanApprove();
    const totalPending = await loanDashboardModel.getTotalPending();
    const totalDisbursed = await loanDashboardModel.getTotalDisbuirse();
    const totalLoanDisbursed = await loanDashboardModel.getTotalLoanDisbursed();
    
    // Fetch additional analytics
    const totalLoanAmountApproved = await loanDashboardModel.getTotalLoanAmountApproved();
    const totalRejected = await loanDashboardModel.getTotalRejected();
    const averageLoanAmount = await loanDashboardModel.getAverageLoanAmount();
    const loanCountByType = await loanDashboardModel.getLoanCountByType();
    const monthlyStats = await loanDashboardModel.getMonthlyLoanStats();
    const overdueLoanCount = await loanDashboardModel.getOverdueLoanCount();
    const repaymentRate = await loanDashboardModel.getLoanRepaymentRate();

    res.status(200).json({
      success: true,
      data: {
        // Basic metrics
        totalLoanApplications: totalLoanApplications.total || 0,
        totalApproved: totalApproved.total || 0,
        totalPending: totalPending.total || 0,
        totalDisbursed: totalDisbursed.total || 0,
        totalLoanDisbursed: totalLoanDisbursed.total || 0,
        
        // Enhanced metrics
        totalLoanAmountApproved: totalLoanAmountApproved.total || 0,
        totalRejected: totalRejected.total || 0,
        averageLoanAmount: averageLoanAmount.average || 0,
        overdueLoanCount: overdueLoanCount.total || 0,
        repaymentRate: repaymentRate?.repayment_rate || 0,
        
        // Detailed breakdowns
        loansByType: loanCountByType || [],
        monthlyStatistics: monthlyStats || []
      }
    });
  } catch (error) {
    console.error('Loan dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan dashboard data',
      error: error.message
    });
  }
};

// Get monthly loan statistics
exports.getMonthlyLoanStats = async (req, res) => {
  try {
    const monthlyStats = await loanDashboardModel.getMonthlyLoanStats();
    
    res.status(200).json({
      success: true,
      data: monthlyStats || []
    });
  } catch (error) {
    console.error('Monthly stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly loan statistics',
      error: error.message
    });
  }
};

// Get loan type distribution
exports.getLoanTypeDistribution = async (req, res) => {
  try {
    const loanTypeData = await loanDashboardModel.getLoanCountByType();
    
    res.status(200).json({
      success: true,
      data: loanTypeData || []
    });
  } catch (error) {
    console.error('Loan type distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan type distribution',
      error: error.message
    });
  }
};

// Get loan health metrics
exports.getLoanHealthMetrics = async (req, res) => {
  try {
    const overdueLoanCount = await loanDashboardModel.getOverdueLoanCount();
    const repaymentRate = await loanDashboardModel.getLoanRepaymentRate();
    
    res.status(200).json({
      success: true,
      data: {
        overdueLoanCount: overdueLoanCount.total || 0,
        repaymentRate: repaymentRate?.repayment_rate || 0,
        fullyPaidLoans: repaymentRate?.fully_paid || 0,
        totalLoansInRepayment: repaymentRate?.total_loans || 0
      }
    });
  } catch (error) {
    console.error('Loan health metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan health metrics',
      error: error.message
    });
  }
};