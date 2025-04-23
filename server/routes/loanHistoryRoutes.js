// routes/loanRoutes.js
const express        = require('express');
const loanController = require('../controllers/loanHistoryController');
const router         = express.Router();

// GET   /loans                → all loans
router.get('/loans', loanController.getAllLoans);

// GET   /loans/:id            → single loan by ID
router.get('/loans/:id', loanController.getLoanById);

// GET   /loans/member/:memberId → all loans for a member
router.get('/member-loan/:memberId', loanController.getLoansByMemberId);

// GET   /loans/:id/history    → loan + its installments
router.get('/loans/:id/history', loanController.getLoanHistory);

// POST  /loans                → create new loan
router.post('/loans', loanController.createLoan);

// PUT   /loans/:id            → update a loan
router.put('/loans/:id', loanController.updateLoan);

// DELETE /loans/:id           → delete a loan
router.delete('/loans/:id', loanController.deleteLoan);

module.exports = router;
