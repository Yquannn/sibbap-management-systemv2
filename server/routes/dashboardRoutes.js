const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorize } = require('../middleware/auth');

// router.get('/total', dashboardController.getTotalMembers);


// Consolidated dashboard endpoint - accessible to admin and staff
router.get('/dashboard-summary', 
  dashboardController.getDashboardData
);

// Optional filter endpoint if needed separately
router.get('/filter', 
  dashboardController.filterDashboardByDate
);




// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.stack);  
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
