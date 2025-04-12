// authController.js
const authModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Secret should be in your .env file
// If it's not there, add JWT_SECRET=your_secret_here to your .env file
// Make sure the secret is complex and at least 32 characters long
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key_that_should_be_very_long_and_complex';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await authModel.findByEmail(email);
    console.log('User Found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For now, maintain direct password comparison for backward compatibility
    // TODO: Replace with bcrypt in the future
    const isMatch = password === user.password;
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('Login Successful, Token Generated');

    // Return the user info and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType
      },
      token // Include the token in the response
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify JWT tokens
exports.authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Optional: Role-based authorization middleware
exports.authorizeRole = (roles = []) => {
  return (req, res, next) => {
    // Convert string to array if only one role is provided
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Check if user exists and has a role that's allowed
    if (!req.user || (roles.length && !roles.includes(req.user.userType))) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to access this resource' 
      });
    }
    
    next();
  };
};

// Refresh token endpoint (optional but recommended)
exports.refreshToken = (req, res) => {
  // Get token from request body
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Verify existing token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        id: decoded.id, 
        email: decoded.email, 
        userType: decoded.userType 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};