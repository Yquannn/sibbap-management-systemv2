const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController.js');


// **Member Routes**
router.post('/announcement', announcementController.insertAnnouncement); // Add new member
router.get('/announcement', announcementController.getAllAnnouncement)
// router.delete('/announcement/:id', announcementController.deleteUser); // Delete member
router.put('/announcement/:id', announcementController.updateAnnouncement);

router.use((err, req, res, next) => {
  console.error('Error:', err); 
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
