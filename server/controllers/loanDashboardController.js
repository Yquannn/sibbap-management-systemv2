const loanDashboardModel = require('../models/loanDashboardModel');

// Get loan dashboard summary with expanded analytics
exports.getLoanDashboardSummary = async (req, res) => {
  try {
    // Basic metrics
    const [
      totalLoanApplications,
      totalApproved,
      totalPending,
      totalDisbursed,
      totalLoanDisbursed,
      totalRejected,
      averageLoanAmount,
      loanCountByType,
      monthlyStats,
      overdueLoanCount,
      repaymentRate,
      averageProcessingTime,
      loanPerformanceMetrics,
      loanAnalysisByPurpose
    ] = await Promise.all([
      loanDashboardModel.getTotalLoanApplication(),
      loanDashboardModel.getTotalLoanApprove(),
      loanDashboardModel.getTotalPending(),
      loanDashboardModel.getTotalDisbuirse(),
      loanDashboardModel.getTotalLoanDisbursed(),
      loanDashboardModel.getTotalRejected(),
      loanDashboardModel.getAverageLoanAmount(),
      loanDashboardModel.getLoanCountByType(),
      loanDashboardModel.getMonthlyLoanStats(),
      loanDashboardModel.getOverdueLoanCount(),
      loanDashboardModel.getLoanRepaymentRate(),
      loanDashboardModel.getAverageProcessingTime(),
      loanDashboardModel.getLoanPerformanceMetrics(),
      loanDashboardModel.getLoanAnalysisByPurpose()
    ]);

    res.status(200).json({
      success: true,
      data: {
        // Basic metrics
        totalLoanApplications: totalLoanApplications.total || 0,
        totalApproved: totalApproved.total || 0,
        totalPending: totalPending.total || 0,
        totalDisbursed: totalDisbursed.total || 0,
        totalLoanDisbursed: totalLoanDisbursed.total || 0,
        totalRejected: totalRejected.total || 0,
        
        // Financial metrics
        averageLoanAmount: averageLoanAmount.average || 0,
        overdueLoanCount: overdueLoanCount.total || 0,
        repaymentRate: repaymentRate?.repayment_rate || 0,
        
        // Performance metrics
        performanceMetrics: {
          avgProcessingDays: averageProcessingTime?.avg_days || 0,
          approvalRate: loanPerformanceMetrics?.approval_rate || 0,
          disbursementRate: loanPerformanceMetrics?.disbursement_rate || 0,
          avgCompletionDays: loanPerformanceMetrics?.avg_completion_days || 0,
          applicationRate: ((totalLoanApplications.total / 100) * 85) || 0, // Example calculation
          processingSpeed: ((averageProcessingTime?.avg_days || 3) / 5) * 100, // Normalized to percentage
          satisfaction: 92, // Example static value - replace with actual calculation
          successRate: loanPerformanceMetrics?.success_rate || 0
        },
        
        // Detailed breakdowns
        loansByType: loanCountByType || [],
        monthlyStatistics: monthlyStats || [],
        loanAnalysis: loanAnalysisByPurpose || []
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

// Get loan performance metrics
exports.getLoanPerformanceMetrics = async (req, res) => {
  try {
    const [performanceMetrics, averageProcessingTime] = await Promise.all([
      loanDashboardModel.getLoanPerformanceMetrics(),
      loanDashboardModel.getAverageProcessingTime()
    ]);

    res.status(200).json({
      success: true,
      data: {
        avgProcessingDays: averageProcessingTime?.avg_days || 0,
        approvalRate: performanceMetrics?.approval_rate || 0,
        disbursementRate: performanceMetrics?.disbursement_rate || 0,
        avgCompletionDays: performanceMetrics?.avg_completion_days || 0,
        applicationRate: 85, // Example value
        processingSpeed: 90, // Example value
        satisfaction: 92, // Example value
        successRate: performanceMetrics?.success_rate || 0
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan performance metrics',
      error: error.message
    });
  }
};

// Get loan analysis by purpose
exports.getLoanAnalysis = async (req, res) => {
  try {
    const loanAnalysis = await loanDashboardModel.getLoanAnalysisByPurpose();
    
    res.status(200).json({
      success: true,
      data: loanAnalysis || []
    });
  } catch (error) {
    console.error('Loan analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loan analysis data',
      error: error.message
    });
  }
};

// Existing endpoints remain unchanged
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