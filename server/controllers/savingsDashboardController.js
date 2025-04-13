const savingsDashboardModel = require('../models/savingsDashboardModel');

// Get savings dashboard summary
exports.getSavingsDashboardSummary = async (req, res) => {
  try {
    // Fetch all totals
    const totalRegularSavings = await savingsDashboardModel.getTotalRegularSavings();
    const totalDeposits = await savingsDashboardModel.getTotalDeposits();
    const totalWithdrawals = await savingsDashboardModel.getTotalWithdrawals();
    const totalDisbursementSavings = await savingsDashboardModel.getTotalDisbursementSavings();
    const totalShareCapital = await savingsDashboardModel.getTotalShareCapital();
    const totalTimedeposit = await savingsDashboardModel.getTotalTimedeposit();

    // Fetch member counts (make sure these functions exist in your model)
    const partialMembers = await savingsDashboardModel.getPartialMembersCount();
    const regularMembers = await savingsDashboardModel.getRegularMembersCount();
    const totalMembers = await savingsDashboardModel.getTotalMembersCount();

    res.status(200).json({
      success: true,
      data: {
        regularSavings: totalRegularSavings.total || 0,
        totalDeposits: totalDeposits.total || 0,
        totalWithdrawals: totalWithdrawals.total || 0,
        disbursementSavings: totalDisbursementSavings.total || 0,
        totalShareCapital: totalShareCapital.total || 0,
        totalTimedeposit: totalTimedeposit.total || 0,
        partialMembersCount: partialMembers.total || 0,
        regularMembersCount: regularMembers.total || 0,
        totalMembersCount: totalMembers.total || 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching savings dashboard data',
      error: error.message
    });
  }
};
