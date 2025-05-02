const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { testConnection, localAuth } = require('../config/db');

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
    console.log('Authenticating request with token');

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_for_secure_tokens';
    const decoded = jwt.verify(token, jwtSecret);

    // Check database connection
    const dbConnected = await testConnection();
    let user = null;

    if (dbConnected) {
      // Get user from database
      user = await User.getById(decoded.id);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local authentication in development mode
      if (decoded.email) {
        // Find user in local auth by email
        const localUser = localAuth.users.find(u => u.email === decoded.email);
        if (localUser) {
          user = localUser;
        }
      }
    }

    // Check if user exists
    if (!user) {
      console.log('User not found during token authentication');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    console.log(`User authenticated: ${user.email}`);

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
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      let hasPermission = false;

      // Check database connection
      const dbConnected = await testConnection();

      if (dbConnected) {
        // Check permission in database
        hasPermission = await User.hasPermission(req.user.id, permission);
      } else if (process.env.NODE_ENV === 'development') {
        // Fallback to local permissions in development mode
        if (req.user.role_name === 'Super Admin' ||
            (req.user.permissions &&
             (req.user.permissions.includes('all') || req.user.permissions.includes(permission)))) {
          hasPermission = true;
        }
      }

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
        message: 'Authorization error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = { authenticate, authorize };
