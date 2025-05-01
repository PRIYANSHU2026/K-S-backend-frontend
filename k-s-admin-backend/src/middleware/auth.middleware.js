const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware
 * Verifies JWT token and sets req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.getById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has the required permission
 * Must be used after authenticate middleware
 */
const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      // Check if user has the required permission
      const hasPermission = await User.hasPermission(req.user.id, permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

module.exports = { authenticate, authorize };
