// routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Module-specific report endpoints
router.get('/report-members', reportController.getMembersReport);
router.get('/report-share-capital', reportController.getShareCapitalReport);
router.get('/report-regular-savings', reportController.getRegularSavingsReport);
router.get('/report-time-deposit', reportController.getTimeDepositReport);
router.get('/report-loans', reportController.getLoanReport);
router.get('/report-kalinga', reportController.getKalingaReport);

module.exports = router;