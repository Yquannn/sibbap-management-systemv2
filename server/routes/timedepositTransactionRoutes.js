const express = require('express');
const router = express.Router();
const timedepositTransactionController = require('../controllers/timedepositTransactionController');

router.get('/timedeposit/transactions/:id', timedepositTransactionController.getTransactionsByTimeDepositId);

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
