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
async function updateLoanRemarks(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // expected: { status: "Waiting for Approval", remarks: "Passdue" }
    
    const success = await loanApplicationModel.updateLoanRemarks(id, status, remarks);
    if (!success) {
      return res.status(404).json({ error: "Loan not found" });
    }
    
    // Return the updated status and remarks as expected
    res.json({ status, remarks });
  } catch (error) {
    console.error("Error updating loan remarks:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}


async function updateLoanStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // expected: { status: "Waiting for Approval", remarks: "Passdue" }
    
    const success = await loanApplicationModel.updateLoanStatus(id, status, remarks);
    if (!success) {
      return res.status(404).json({ error: "Loan not found" });
    }
    
    // Return the updated status and remarks as expected
    res.json({ status, remarks });
  } catch (error) {
    console.error("Error updating loan remarks:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}




// Controller to update only the feedback (remarks)
// async function updateFeedback(req, res) {
//   try {
//     const { id } = req.params;
//     const { remarks } = req.body;

//     if (!remarks) {
//       return res.status(400).json({ error: "Remarks are required" });
//     }

//     // Call a separate model function to update only the remarks (feedback)
//     const success = await loanApplicationModel.updateFeedback(id, remarks);
//     if (!success) {
//       return res.status(404).json({ error: "Loan application not found" });
//     }

//     res.json({ message: "Feedback updated successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Internal Server Error", details: error.message });
//   }
// }

async function getAllBorrowers(req, res) {
  try {
    const borrowers = await loanApplicationModel.getAllBorrowers();
    res.status(200).json(borrowers);
  } catch (error) {
    console.error("Error fetching borrowers:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}

// Controller Function
async function getLoanById(req, res) {
  try {
    const { id } = req.params;
    // Assume getMemberLoansById returns an array of loans for a given member id.
    const loans = await loanApplicationModel.getMemberLoansById(id);
    if (!loans || loans.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(loans);
  } catch (error) {
    console.error("Error fetching loan by id:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}



async function getLoanByInformationId(req, res) {
  try {
    // Extract "id" from URL parameters (which represents the memberId)
    const { id } = req.params;
    // Fetch all approved loans for the given member id.
    const loans = await loanApplicationModel.getLoanByInformationId(id);
    if (!loans || loans.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }
    console.log("Request member id:", id);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching loan by member id:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
async function getLoanByInformationIdForAdmin(req, res) {
  try {
    // Extract "id" from URL parameters (which represents the memberId)
    const { id } = req.params;
    // Fetch all approved loans for the given member id.
    const loans = await loanApplicationModel.getLoanByInformationIdForAdmin(id);
    if (!loans || loans.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }
    console.log("Request member id:", id);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching loan by member id:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}




async function getExistingLoan(req, res) {
  try {
    const { id } = req.params;
    const loan = await loanApplicationModel.getExistingLoan(id);
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
  updateLoanRemarks,  // updateFeedback,
  getAllLoanApprove,
  getAllBorrowers,
  getLoanById,
  updateLoanStatus,
  getExistingLoan,
  getLoanByInformationId,
  getLoanByInformationIdForAdmin
};
