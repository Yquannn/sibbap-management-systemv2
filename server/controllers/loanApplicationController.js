// controllers/loanApplicationController.js
const loanApplicationModel = require('../models/loanApplicationModel');

async function createLoanApplication(req, res) {
  try {
    const loanData = req.body;
    const result = await loanApplicationModel.createLoanApplication(loanData);
    res.status(201).json({
      message: 'Loan application created successfully.',
      loanApplicationId: result.loanApplicationId,
    });
  } catch (error) {
    console.error('Error creating loan application:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getLoanApplication(req, res) {
  const { id } = req.params;
  try {
    const application = await loanApplicationModel.getLoanApplicationById(id);
    if (!application) {
      return res.status(404).json({ error: 'Loan application not found.' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching loan application:', error);
    res.status(500).json({ error: error.message });
  }
}

// async function getAllLoanApplications(req, res) {
//   try {
//     const applications = await loanApplicationModel.getAllLoanApplications();
//     res.json(applications);
//   } catch (error) {
//     console.error('Error fetching loan applications:', error);
//     res.status(500).json({ error: error.message });
//   }
// }

module.exports = {
  createLoanApplication,
  getLoanApplication,
//   getAllLoanApplications,
};
