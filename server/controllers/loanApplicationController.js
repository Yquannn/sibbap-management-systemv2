const loanApplicationModel = require("../models/loanApplicationModel");

async function createLoanApplication(req, res) {
  try {
    const loanData = req.body;
    const result = await loanApplicationModel.createLoanApplication(loanData);
    res.status(201).json({
      message: "Loan application created successfully.",
      loanApplicationId: result.loanApplicationId,
    });
  } catch (error) {
    console.error("Error creating loan application:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getLoanApplication(req, res) {
  const { id } = req.params;
  try {
    const application = await loanApplicationModel.getLoanApplicationById(id);
    if (!application) {
      return res.status(404).json({ error: "Loan application not found." });
    }
    res.json(application);
  } catch (error) {
    console.error("Error fetching loan application:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllLoanApplicant(req, res) {
  try {
    const applications = await loanApplicationModel.getAllLoanApplicant();
    res.json(applications);
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllLoanApprove(req, res) {
  try {
    const applications = await loanApplicationModel.getAllLoanApprove();
    res.json(applications);
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({ error: error.message });
  }
}


//// Controller to update the loan status only
async function updateLoanStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // Only update status here

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Call the model function that updates the status (using default remarks)
    const success = await loanApplicationModel.updateLoanStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    res.json({ message: "Loan status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

// Controller to update only the feedback (remarks)
async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ error: "Remarks are required" });
    }

    // Call a separate model function to update only the remarks (feedback)
    const success = await loanApplicationModel.updateFeedback(id, remarks);
    if (!success) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    res.json({ message: "Feedback updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

async function getAllBorrowers(req, res) {
  try {
    const borrowers = await loanApplicationModel.getAllBorrowers();
    res.status(200).json(borrowers);
  } catch (error) {
    console.error("Error fetching borrowers:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}

async function getLoanById(req, res) {
  try {
    const { id } = req.params;
    const loan = await loanApplicationModel.getMemberLoansById(id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(loan);
  } catch (error) {
    console.error("Error fetching loan by id:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}




module.exports = {
  createLoanApplication,
  getLoanApplication,
  getAllLoanApplicant,
  updateLoanStatus,
  updateFeedback,
  getAllLoanApprove,
  getAllBorrowers,
  getLoanById
};
