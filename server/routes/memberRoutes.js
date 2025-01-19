const express = require('express');

const router = express.Router();
const multer = require('multer');

const memberController = require('../controllers/memberController');
const dashboardController = require('../controllers/dashboardController');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


router.get('/total', dashboardController.getTotalMembers);
router.get('/members', memberController.getMembers); 
router.get('/members/savings', memberController.getMemberSavings);

// router.get('/members/beneficiaries', memberController.getBeneficiaries);        
router.get('/members/:id', memberController.getMemberById); 
router.post('/members', upload.single('idPicture'), memberController.addMember);
router.put('/members/:id', upload.single('idPicture'), memberController.updateMember); 
router.delete('/members/:id', memberController.deleteMember); 
router.put('/activate/:memberId', memberController.activateAccount);


router.use((err, req, res, next) => {
  console.error('Error:', err); 
  res.status(err.status || 500).json({ message: err.message || 'An error occurred while processing your request.' });
});

module.exports = router;
