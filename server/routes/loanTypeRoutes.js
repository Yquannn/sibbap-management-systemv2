// routes/loanTypeRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loanTypeController');

// GET    /loan-types?includeArchived=true
router.get('/loan-types',                ctrl.getAllLoanTypes);
// GET    /loan-types/:id
router.get('/loan-types/:id',             ctrl.getLoanTypeById);
// POST   /loan-types
router.post('/loan-types',               ctrl.createLoanType);
// PUT    /loan-types/:id
router.put('/loan-types/:id',             ctrl.updateLoanType);
// PATCH  /loan-types/:id/archive
router.patch('/loan-types/:id/archive',   ctrl.archiveLoanType);
// PATCH  /loan-types/:id/unarchive
router.patch('/loan-types/:id/unarchive', ctrl.unarchiveLoanType);
// In routes/loanTypeRoutes.js
router.get('/by-name/:name', ctrl.getLoanTypeByName);

module.exports = router;
