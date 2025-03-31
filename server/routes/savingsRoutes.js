const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');

// Update balance for withdrawal
router.put('/withdraw', savingsController.withdraw);

// Update balance for deposit
router.put('/deposit', savingsController.deposit);
router.get('/member/earnings/:memberId', savingsController.getEarnings); 


router.post('/transaction', savingsController.createTransaction);  // Create a transaction
router.get('/transactions', savingsController.getAllTransactions); // Get all transactions
router.get('/transactions/:transactionNumber', savingsController.getTransactionById); // Get transaction by ID

router.get("/member/savings/:memberId", savingsController.getRegularSavingsMemberInfo);

// Centralized error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
