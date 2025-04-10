const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Create notification
router.post('/notifications', notificationController.createNotification);

// Get notifications by userId
router.get('/notifications/:userId', notificationController.getUserNotifications);

// Mark notification as read
router.put('/notifications/:id/read', notificationController.markNotificationAsRead);

module.exports = router;
