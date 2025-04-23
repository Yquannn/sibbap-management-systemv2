const express = require('express');
const router = express.Router();
const controller = require('../controllers/loanFactorController');

// POST   /loan-factors   → add a new term
router.post('/loan/factor', controller.addLoanFactor);

router.get('/loan-factor', controller.getAllLoanFactors);

// GET   /loan-factors/:n    → get a single term by n
router.get('/loan-factor/:n', controller.getLoanFactor);

// PUT    /loan-factors/:n → update an existing term by its n
router.put('/loan/factor:n', controller.updateLoanFactor);

module.exports = router;
