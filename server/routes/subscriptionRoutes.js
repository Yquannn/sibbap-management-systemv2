const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');

router.post('/subscribe', subscriptionController.subscribe);
router.delete('/unsubscribe', subscriptionController.unsubscribe);

module.exports = router;