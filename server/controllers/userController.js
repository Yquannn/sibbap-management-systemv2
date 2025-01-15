const { insertUser } = require('../models/userModel'); 
const {updateUserById} = require('../models/userModel');
const validator = require('validator'); 

const db = require('../config/db');


const { getAllUsers } = require('../models/userModel'); 

// Get all users
exports.getAllUsers = async (req, res) => {
  try {

    const users = await getAllUsers();

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Send success response with the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users from the database' });
  }
};

exports.addUser = async (req, res) => {
  const { userName, age, gender, address, contactNo, email, password, userType } = req.body;

  // Validate input fields
  if (!userName || !age || !gender || !address || !contactNo || !email || !password || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {

    // Insert the user into the database
    const userId = await insertUser(userName, age, gender, address, contactNo, email, password, userType);

    // Send success response with the new user ID
    res.status(201).json({
      message: 'User added successfully',
      userId: userId, // Return the ID of the newly created user
    });
  } catch (error) {
    console.error('Error adding user:', error.message);
    
    // Send a more specific error message to the client
    if (error.message.includes('Database connection was refused')) {
      res.status(503).json({ message: 'Database is unavailable, please try again later.' });
    } else if (error.message.includes('User already exists')) {
      res.status(409).json({ message: 'User already exists with this email address.' });
    } else {
      res.status(500).json({ message: 'Error adding user to the database' });
    }
  }
};


exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const accountQuery = "DELETE FROM users WHERE id = ?";
    await connection.execute(accountQuery, [id]);
    await connection.commit();

    res.json({ message: 'user deleted successfully' });
  } catch (error) {
    console.error('Error deleting data from MySQL:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error deleting member' });
  } finally {
    connection.release();
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { userName, age, gender, address, contactNo, email, userType } = req.body;

  if (!userName || !age || !gender || !address || !contactNo || !email || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const success = await updateUserById(id, { userName, age, gender, address, contactNo, email, userType });
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Error updating user' });
  }
};