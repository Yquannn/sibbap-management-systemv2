const { insertUser } = require('../models/userModel'); 
const { updateUserById, getUserByEmail } = require('../models/userModel'); 
const db = require('../config/db');
const { getAllUsers } = require('../models/userModel'); 

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
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

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const userId = await insertUser(userName, age, gender, address, contactNo, email, password, userType);
    res.status(201).json({
      message: 'User added successfully',
      userId: userId, 
    });
  } catch (error) {
    console.error('Error adding user:', error.message);
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

    res.json({ message: 'User deleted successfully' });
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


exports.getUserByEmail = async (req, res) => {
  const email = req.params.email;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const { user, member } = await getUserByEmail(email);

    // Return 404 only if neither a user nor a member is found
    if (!user && !member) {
      return res.status(404).json({ message: 'User or member not found' });
    }

    res.status(200).json({ user, member });
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    res.status(500).json({ message: 'Error fetching user from the database' });
  }
};
