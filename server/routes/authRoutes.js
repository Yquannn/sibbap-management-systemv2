const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');


router.post('/auth', authController.login);
router.post('/auth/login-member', authController.loginMember);


router.use((err, req, res, next) => {
  console.error('Error:', err); 
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
