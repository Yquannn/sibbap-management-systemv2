// routes/loanApplicationRoutes.js
const express = require('express');
const router = express.Router();
const loanApplicationController = require('../controllers/loanApplicationController');

// POST endpoint to create a new loan application
router.post('/loan-application', loanApplicationController.createLoanApplication);

// router.get('/loan-application', loanApplicationController.getAllLoanApplications);

// Get a single loan application by id (with details)
router.get('/loan-application/:id', loanApplicationController.getLoanApplication);

module.exports = router;
