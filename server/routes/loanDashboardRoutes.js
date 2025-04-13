const express = require('express');
const router = express.Router();
const loanDashboardController = require('../controllers/loanDashboardController');

// Get notifications by userId
router.get('/loan-summary', loanDashboardController.getLoanDashboardSummary);



module.exports = router;
