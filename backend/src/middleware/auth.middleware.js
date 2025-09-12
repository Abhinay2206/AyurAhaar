const jwt = require('jsonwebtoken');
const User = require('../models/UserBase');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find the user
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error during authentication' });
  }
}

// Middleware to check if user is a patient
function requirePatientRole(req, res, next) {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Patient role required' });
  }
  next();
}

module.exports = { authenticateToken, requirePatientRole };
