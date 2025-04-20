const savingsDashboardModel = require('../models/savingsDashboardModel');

exports.getSavingsDashboardSummary = async (req, res) => {
  try {
    // Fetch all basic totals
    const [
      totalRegularSavings,
      totalDeposits,
      totalWithdrawals,
      totalDisbursementSavings,
      totalShareCapital,
      totalTimedeposit,
      partialMembers,
      regularMembers,
      totalMembers,
      comparisons,
      timeDepositAnalytics,
      shareCapitalTrends,
      maturityTimeline,
      transactionHistory,
      ageDistribution
    ] = await Promise.all([
      savingsDashboardModel.getTotalRegularSavings(),
      savingsDashboardModel.getTotalDeposits(),
      savingsDashboardModel.getTotalWithdrawals(),
      savingsDashboardModel.getTotalDisbursementSavings(),
      savingsDashboardModel.getTotalShareCapital(),
      savingsDashboardModel.getTotalTimedeposit(),
      savingsDashboardModel.getPartialMembersCount(),
      savingsDashboardModel.getRegularMembersCount(),
      savingsDashboardModel.getTotalMembersCount(),
      savingsDashboardModel.getPreviousPeriodComparisons(),
      savingsDashboardModel.getTimeDepositAnalytics(),
      savingsDashboardModel.getShareCapitalTrends(),
      savingsDashboardModel.getTimeDepositMaturityTimeline(),
      savingsDashboardModel.getSavingsTransactionHistory(),
      savingsDashboardModel.getMemberAgeDistribution()
    ]);

    // Calculate trends and percentages
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const savingsTrend = calculateTrend(
      comparisons.current_month_savings,
      comparisons.previous_month_savings
    );

    const membersTrend = calculateTrend(
      comparisons.current_month_members,
      comparisons.previous_month_members
    );

    res.status(200).json({
      success: true,
      data: {
        // Basic totals
        regularSavings: totalRegularSavings.total || 0,
        totalDeposits: totalDeposits.total || 0,
        totalWithdrawals: totalWithdrawals.total || 0,
        disbursementSavings: totalDisbursementSavings.total || 0,
        totalShareCapital: totalShareCapital.total || 0,
        totalTimedeposit: totalTimedeposit.total || 0,
        
        // Member counts
        partialMembersCount: partialMembers.total || 0,
        regularMembersCount: regularMembers.total || 0,
        totalMembersCount: totalMembers.total || 0,
        
        // Trends and comparisons
        savingsTrend,
        membersTrend,
        previousPeriodComparisons: comparisons,
        
        // Detailed analytics
        timeDepositAnalytics,
        shareCapitalTrends,
        maturityTimeline,
        transactionHistory,
        ageDistribution,
        
        // Meta information
        lastUpdated: new Date().toISOString(),
        periodCovered: {
          start: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
          end: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error in getSavingsDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings dashboard data',
      error: error.message
    });
  }
};