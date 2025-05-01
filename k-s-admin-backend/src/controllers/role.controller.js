const Role = require('../models/role.model');

/**
 * Get all roles
 * @route GET /api/roles
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.getAll();

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: { roles }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: error.message
    });
  }
};

/**
 * Get a single role
 * @route GET /api/roles/:id
 */
const getRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.getById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { role }
    });
  } catch (error) {
    console.error('Get role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get role',
      error: error.message
    });
  }
};

/**
 * Create a new role
 * @route POST /api/roles
 */
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const role = await Role.create({
      name,
      description,
      permissions
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { role }
    });
  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

/**
 * Update a role
 * @route PUT /api/roles/:id
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await Role.getById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Don't allow changing Super Admin name
    if (existingRole.name === 'Super Admin' && name && name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change Super Admin role name'
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      permissions
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const role = await Role.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: { role }
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

/**
 * Delete a role
 * @route DELETE /api/roles/:id
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const result = await Role.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Super Admin')) {
        return res.status(403).json({
          success: false,
          message: 'The Super Admin role cannot be deleted'
        });
      }

      if (error.message.includes('users assigned')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role because there are users assigned to it'
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};

/**
 * Get users by role
 * @route GET /api/roles/:id/users
 */
const getRoleUsers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.getById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const users = await Role.getUsers(id);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get role users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get role users',
      error: error.message
    });
  }
};

/**
 * Get available permissions
 * @route GET /api/roles/permissions/available
 */
const getAvailablePermissions = async (req, res) => {
  try {
    const permissions = await Role.getAvailablePermissions();

    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: { permissions }
    });
  } catch (error) {
    console.error('Get available permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get available permissions',
      error: error.message
    });
  }
};

module.exports = {
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRoleUsers,
  getAvailablePermissions
};
