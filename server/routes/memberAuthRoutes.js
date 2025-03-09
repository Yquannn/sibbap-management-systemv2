const express = require('express');
const memberAuthController = require('../controllers/memberAuthController');

const router = express.Router();


// Route for member login
router.post('/auth/login', memberAuthController.login);

// Route for member logout
// router.post('/auth/logout', memberAuthController.logout);

module.exports = router;

