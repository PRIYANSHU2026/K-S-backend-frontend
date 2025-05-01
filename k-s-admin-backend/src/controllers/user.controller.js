const User = require('../models/user.model');
const Role = require('../models/role.model');

/**
 * Get all users
 * @route GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { name, email, role_id } = req.query;

    // Create filters object from query parameters
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (role_id) filters.role_id = role_id;

    const users = await User.getAll(filters);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

/**
 * Get a single user
 * @route GET /api/users/:id
 */
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * Create a new user
 * @route POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role exists
    const role = await Role.getById(role_id);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if email already exists
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Get file path from upload middleware
    let avatar = null;
    if (req.file) {
      // Create relative path for client to access
      avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.create({
      name,
      email,
      password,
      role_id,
      avatar
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

/**
 * Update a user
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role_id } = req.body;

    // Check if user exists
    const existingUser = await User.getById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If email is changing, check if new email already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await User.getByEmail(email);
      if (userWithEmail) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // If role_id is provided, validate it exists
    if (role_id) {
      const role = await Role.getById(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role not found'
        });
      }
    }

    // Handle file upload
    let avatar = undefined;
    if (req.file) {
      // Create relative path for client to access
      avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      password,
      role_id,
      avatar
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

/**
 * Delete a user
 * @route DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow user to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    try {
      const result = await User.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('last Super Admin')) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete the last Super Admin user'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
