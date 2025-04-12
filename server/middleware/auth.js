// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key_that_should_be_very_long_and_complex';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Get the token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Convert string to array if only one role is provided
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Check if user has one of the required roles
    if (!req.user || (roles.length && !roles.includes(req.user.userType))) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to access this resource' 
      });
    }
    
    next();
  };
};

// Token validation endpoint
const validateToken = (req, res) => {
  // The user has already been authenticated by the middleware
  // If we reach here, the token is valid
  res.status(200).json({ 
    valid: true, 
    user: {
      id: req.user.id,
      email: req.user.email,
      userType: req.user.userType
    }
  });
};

module.exports = {
  authenticateToken,
  authorize,
  validateToken
};