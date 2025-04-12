const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');


router.post('/auth', authController.login);
// router.get('/auth/login-member', authController.getAllMembersData);


router.use((err, req, res, next) => {
  console.error('Error:', err); 
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;


// // routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const { authenticateToken, authorize, validateToken } = require('../middleware/auth');

// // Login route
// router.post('/auth', authController.login);

// // Token validation route
// router.get('/auth/validate', authenticateToken, validateToken);

// // Token refresh route
// router.post('/auth/refresh-token', authController.refreshToken);

// // Example of a protected route with role-based access
// router.get('/user/details/:id', 
//   authenticateToken, 
//   authorize(['System Admin', 'Treasurer', 'Loan Manager', 'Teller']),
//   (req, res) => {
//     // Your controller logic here
//     // This route is only accessible to users with the specified roles
//   }
// );

// // Another example for member-only routes
// router.get('/member/profile',
//   authenticateToken,
//   authorize('Member'),
//   (req, res) => {
//     // Your controller logic here
//     // This route is only accessible to Members
//   }
// );

// module.exports = router;