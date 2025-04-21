const savingsDashboardModel = require('../models/savingsDashboardModel');

exports.getSavingsDashboardSummary = async (req, res) => {
  try {
    // Fetch all data with enhanced error handling
    const dashboardData = await Promise.allSettled([
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
      savingsDashboardModel.getShareCapitalAnalytics(), // New analytics
      savingsDashboardModel.getTimeDepositMaturityTimeline(),
      savingsDashboardModel.getSavingsTransactionHistory(),
      savingsDashboardModel.getMemberAgeDistribution()
    ]);

    // Process results and handle any failed promises
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
      shareCapitalAnalytics,
      maturityTimeline,
      transactionHistory,
      ageDistribution
    ] = dashboardData.map(result => 
      result.status === 'fulfilled' ? result.value : null
    );

    // Utility functions
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return Number(((current - previous) / previous * 100).toFixed(2));
    };

    const formatCurrency = (amount) => {
      return Number(parseFloat(amount || 0).toFixed(2));
    };

    // Calculate trends and percentages
    const savingsTrend = calculateTrend(
      comparisons?.current_month_savings,
      comparisons?.previous_month_savings
    );

    const membersTrend = calculateTrend(
      comparisons?.current_month_members,
      comparisons?.previous_month_members
    );

    // Share capital specific calculations
    const shareCapitalMetrics = shareCapitalAnalytics ? {
      monthlyTrends: shareCapitalAnalytics.monthlyTrends,
      distribution: shareCapitalAnalytics.distribution,
      yearlyComparison: shareCapitalAnalytics.yearlyComparison,
      memberTypeAnalysis: shareCapitalAnalytics.memberTypeAnalysis,
      
      // Additional derived metrics
      averageShareCapital: formatCurrency(
        totalShareCapital.total / totalMembers.total
      ),
      shareCapitalUtilization: formatCurrency(
        (totalShareCapital.total / (totalTimedeposit.total + totalRegularSavings.total)) * 100
      )
    } : null;

    res.status(200).json({
      success: true,
      data: {
        // Basic totals with currency formatting
        regularSavings: formatCurrency(totalRegularSavings?.total),
        totalDeposits: formatCurrency(totalDeposits?.total),
        totalWithdrawals: formatCurrency(totalWithdrawals?.total),
        disbursementSavings: formatCurrency(totalDisbursementSavings?.total),
        totalShareCapital: formatCurrency(totalShareCapital?.total),
        totalTimedeposit: formatCurrency(totalTimedeposit?.total),
        
        // Member counts
        membershipStats: {
          partial: partialMembers?.total || 0,
          regular: regularMembers?.total || 0,
          total: totalMembers?.total || 0,
          distribution: {
            partialPercentage: ((partialMembers?.total / totalMembers?.total) * 100).toFixed(2),
            regularPercentage: ((regularMembers?.total / totalMembers?.total) * 100).toFixed(2)
          }
        },
        
        // Trends and comparisons
        trends: {
          savings: savingsTrend,
          members: membersTrend,
          previousPeriod: comparisons
        },
        
        // Enhanced analytics
        analytics: {
          timeDeposit: timeDepositAnalytics,
          shareCapital: shareCapitalMetrics,
          maturityTimeline,
          transactionHistory,
          demographics: ageDistribution
        },
        
        // Meta information
        metadata: {
          lastUpdated: new Date().toISOString(),
          periodCovered: {
            start: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
            end: new Date().toISOString()
          },
          dataCompleteness: dashboardData.filter(result => 
            result.status === 'fulfilled'
          ).length / dashboardData.length * 100
        }
      }
    });
  } catch (error) {
    console.error('Error in getSavingsDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching savings dashboard data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};