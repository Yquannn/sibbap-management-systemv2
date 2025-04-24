const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/kalingaFundSettings.controller');

router.get('/kalinga/settings', settingsController.getSettings);
router.get('/kalinga/settings/active', settingsController.getActiveSettings);
router.post('/kalinga/settings', settingsController.createSettings);
router.put('/kalinga/settings/:fund_id', settingsController.updateSettings);

module.exports = router;