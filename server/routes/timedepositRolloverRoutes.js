// rolloverRoutes.js
const express = require('express');
const router = express.Router();
const RolloverController = require('../controllers/timedepositRolloverController');

router.post('/timedeposit/rollover', RolloverController.create);
router.get('/timedeposit/rollover/:timeDepositId', RolloverController.getByTimeDepositId);
// Add more routes as needed

module.exports = router;