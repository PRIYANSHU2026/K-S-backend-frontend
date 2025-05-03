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
      console.log('Auth failed: No Authorization header or invalid format');
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Authenticating request with token:', token.substring(0, 15) + '...');

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_for_secure_tokens';
    console.log('Using JWT secret:', jwtSecret.substring(0, 5) + '...');

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('Token decoded successfully, user ID:', decoded.id);
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      throw jwtError;
    }

    // Check database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();
    console.log('Database connection status:', dbConnected ? 'Connected' : 'Not connected');

    let user = null;

    if (dbConnected) {
      // Get user from database
      console.log('Getting user from database, ID:', decoded.id);
      user = await User.getById(decoded.id);
      console.log('User from database:', user ? 'Found' : 'Not found');
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local authentication in development mode
      console.log('Using local auth fallback in dev mode');
      if (decoded.email) {
        // Find user in local auth by email
        const localUser = localAuth.users.find(u => u.email === decoded.email);
        if (localUser) {
          console.log('Found user in local auth:', localUser.email);
          user = localUser;
        } else {
          console.log('User not found in local auth:', decoded.email);
        }
      } else {
        console.log('No email in decoded token, can\'t use local auth');
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
      console.log(`Checking permission: ${permission} for user: ${req.user.email}`);

      let hasPermission = false;

      // Check database connection
      const dbConnected = await testConnection();
      console.log('Database connection status for permission check:', dbConnected ? 'Connected' : 'Not connected');

      if (dbConnected) {
        // Check permission in database
        console.log('Checking permissions in database');
        hasPermission = await User.hasPermission(req.user.id, permission);
      } else if (process.env.NODE_ENV === 'development') {
        // Fallback to local permissions in development mode
        console.log('Checking permissions in local auth');

        if (req.user.role_name === 'Super Admin' || req.user.role === 'Super Admin') {
          console.log('User is Super Admin - granting all permissions');
          hasPermission = true;
        } else if (req.user.permissions && Array.isArray(req.user.permissions)) {
          console.log('User permissions array:', req.user.permissions);

          if (req.user.permissions.includes('all') || req.user.permissions.includes(permission)) {
            console.log(`User has the required permission: ${permission}`);
            hasPermission = true;
          } else {
            console.log(`User does not have the required permission: ${permission}`);
          }
        } else if (req.user.role && typeof req.user.role === 'object' && req.user.role.permissions) {
          console.log('Role permissions array:', req.user.role.permissions);

          if (req.user.role.permissions.includes('all') || req.user.role.permissions.includes(permission)) {
            console.log(`User role has the required permission: ${permission}`);
            hasPermission = true;
          } else {
            console.log(`User role does not have the required permission: ${permission}`);
          }
        } else {
          console.log('Could not find permissions array for user');
        }
      }

      if (!hasPermission) {
        console.log(`Authorization failed for permission: ${permission}`);
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Insufficient permissions'
        });
      }

      console.log(`Authorization successful for permission: ${permission}`);
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
