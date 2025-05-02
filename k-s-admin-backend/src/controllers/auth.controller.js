const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { testConnection, localAuth } = require('../config/db');

/**
 * Handle user login
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log(`Login attempt for email: ${email}`);

    // Check database connection
    const dbConnected = await testConnection();
    let user = null;
    let isPasswordValid = false;

    if (dbConnected) {
      // Normal database authentication
      console.log('Using database authentication');
      user = await User.getByEmail(email);

      if (user) {
        // Verify password
        isPasswordValid = await User.verifyPassword(password, user.password);

        if (isPasswordValid) {
          // Update last login timestamp
          await User.updateLastLogin(user.id);
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local authentication in development mode
      console.log('Using local authentication fallback');
      user = await localAuth.getByEmail(email);

      if (user) {
        // Verify password
        isPasswordValid = await localAuth.verifyPassword(password, user.password);
      }
    }

    // If authentication failed
    if (!user || !isPasswordValid) {
      console.log(`Authentication failed for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_for_secure_tokens',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`Login successful for user: ${user.email}`);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const me = async (req, res) => {
  try {
    // User is already attached by the authenticate middleware
    const user = req.user;

    // Return user data without sensitive information
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: {
            id: user.role_id,
            name: user.role_name
          },
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

/**
 * Change user password
 * @route PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.getByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await User.update(user.id, { password: newPassword });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = {
  login,
  me,
  changePassword
};
