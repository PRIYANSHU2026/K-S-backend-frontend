const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadUserAvatar, handleUploadError } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', authorize('users.view'), userController.getAllUsers);

// Get a single user
router.get('/:id', authorize('users.view'), userController.getUser);

// Create a new user
router.post(
  '/',
  authorize('users.create'),
  uploadUserAvatar.single('avatar'),
  handleUploadError,
  userController.createUser
);

// Update a user
router.put(
  '/:id',
  authorize('users.edit'),
  uploadUserAvatar.single('avatar'),
  handleUploadError,
  userController.updateUser
);

// Delete a user
router.delete('/:id', authorize('users.delete'), userController.deleteUser);

module.exports = router;
