const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');



//router.get('/user/:id', userController.getUserById);
router.post('/user', userController.addUser); 
router.get('/users', userController.getAllUsers)
router.delete('/user/:id', userController.deleteUser); 
router.put('/user/:id', userController.updateUser);


// router.put('/user/:id', userController.updateUser); 

router.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred while processing your request.',
  });
});

module.exports = router;
