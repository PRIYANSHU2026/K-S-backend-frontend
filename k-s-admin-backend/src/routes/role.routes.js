const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get available permissions (used for role creation/editing)
router.get('/permissions/available', authorize('roles.view'), roleController.getAvailablePermissions);

// Get all roles
router.get('/', authorize('roles.view'), roleController.getAllRoles);

// Get a single role
router.get('/:id', authorize('roles.view'), roleController.getRole);

// Get users by role
router.get('/:id/users', authorize('roles.view'), roleController.getRoleUsers);

// Create a new role
router.post('/', authorize('roles.create'), roleController.createRole);

// Update a role
router.put('/:id', authorize('roles.edit'), roleController.updateRole);

// Delete a role
router.delete('/:id', authorize('roles.delete'), roleController.deleteRole);

module.exports = router;
