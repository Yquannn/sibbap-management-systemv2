// routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const memberController = require('../controllers/memberController');
const dashboardController = require('../controllers/dashboardController');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Define the fields for multiple file uploads.
const multiUpload = upload.fields([
  { name: 'id_picture', maxCount: 1 },
  { name: 'barangay_clearance', maxCount: 1 },
  { name: 'tax_identification', maxCount: 1 },
  { name: 'valid_id', maxCount: 1 },
  { name: 'membership_agreement', maxCount: 1 }
]);

// Example routes
router.get('/total', dashboardController.getTotalMembers);
router.get('/members', memberController.getMembers); 
router.get('/members/savings', memberController.getMemberSavings);
router.get('/member/email/:email', memberController.getMemberByEmail);
router.get('/member/:id', memberController.getMemberById);

router.patch('/members/:memberId/financials', memberController.updateFinancials);
router.get('/members/applicant', memberController.getAllMemberApplicants);

// Use multiUpload middleware for routes that require file uploads.
router.post('/register-member', multiUpload, memberController.addMember);
router.put('/members/:id', multiUpload, memberController.updateMember); 
router.delete('/members/:id', memberController.deleteMember); 
router.put('/activate/:memberId', memberController.activateAccount);

// Global error handler
router.use((err, req, res, next) => {
  console.error('Error:', err); 
  res.status(err.status || 500).json({ message: err.message || 'An error occurred while processing your request.' });
});

module.exports = router;
