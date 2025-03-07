const authModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // Commented out JWT
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', email, password);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await authModel.findByEmail(email);
    console.log('User Found:', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify Password (No hashing, direct comparison)
    const isMatch = password === user.password;
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Commented out JWT token generation
    // const token = jwt.sign(
    //   { id: user.id, email: user.email, userType: user.userType },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    console.log('Login Successful');

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType, // Determined by the backend
        // token  // Commented out token
      },
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
