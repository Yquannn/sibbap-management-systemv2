// routes/loanApplicationRoutes.js
const express = require('express');
const router = express.Router();
const loanApplicationController = require('../controllers/loanApplicationController');

// POST endpoint to create a new loan application
router.post('/loan-application', loanApplicationController.createLoanApplication);

router.get('/loan-application/all', loanApplicationController.getAllLoanApplicant);

// Get a single loan application by id (with details)
router.get('/loan-application/:id', loanApplicationController.getLoanApplication);

router.get("/loan-applicant/approve", loanApplicationController.getAllLoanApprove);

router.get("/borrowers", loanApplicationController.getAllBorrowers);

router.get("/member-loan-application/:id", loanApplicationController.getLoanById);

router.get("/member-existing-loan-application/:id", loanApplicationController.getExistingLoan);

router.get("/member-loan/:id", loanApplicationController.getLoanByInformationId);

router.get("/member-loan-admin-view/:id", loanApplicationController.getLoanByInformationIdForAdmin);



router.put("/loan-applicant/:id/remarks", loanApplicationController.updateLoanRemarks);

router.put("/loan-applicant/:id/approve", loanApplicationController.updateLoanStatus);

// router.put("/loan-applicant/:id/feedback", loanApplicationController.updateFeedback);



module.exports = router;
