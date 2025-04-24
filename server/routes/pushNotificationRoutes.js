// routes/pushNotificationRoutes.js
const express = require('express');
const router = express.Router();
const pushNotificationController = require('../controllers/pushNotificationController.js');

router.post('/send-push-notification', pushNotificationController.sendPushNotification);
// In your pushNotificationRoutes.js
// router.post('/test-notification', pushNotificationController.testNotification);
router.get('/vapid-public-key', pushNotificationController.getVapidPublicKey);


module.exports = router;