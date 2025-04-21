const express = require('express');
const router = express.Router();
const shareCapitalController = require('../controllers/shareCapitalController');
// const { authenticateToken } = require('../middleware/authMiddleware'); // Adjust path as needed

// // Apply authentication middleware to all routes
// router.use(authenticateToken);

// Create a new share capital transaction (generic)
router.post('/share-capital/transactions', shareCapitalController.createShareCapitalTransaction);

// Get all share capital transactions for a specific member
router.get('/member/share-capital/:memberId', shareCapitalController.getShareCapitalByMemberId);

// Get all share capital transactions
router.get('/share-capital/transactions', shareCapitalController.getAllShareCapitalTransactions);

// Specific transaction type endpoints
router.post('/member/share-capital/deposit', shareCapitalController.depositShareCapital);
router.post('/member/share-capital/withdraw', shareCapitalController.withdrawShareCapital);
router.post('/member/share-capital/transfer', shareCapitalController.transferShareCapital);

module.exports = router;