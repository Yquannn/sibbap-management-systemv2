const express = require('express');
const router = express.Router();
const savingsDashboardController = require('../controllers/savingsDashboardController');


// Get notifications by userId
router.get('/summary', savingsDashboardController.getSavingsDashboardSummary);



module.exports = router;
