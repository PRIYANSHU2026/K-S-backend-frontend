const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all categories
router.get('/', authorize('categories.view'), categoryController.getAllCategories);

// Get a single category
router.get('/:id', authorize('categories.view'), categoryController.getCategory);

// Get products by category
router.get('/:id/products', authorize('categories.view'), categoryController.getCategoryProducts);

// Create a new category
router.post('/', authorize('categories.create'), categoryController.createCategory);

// Update a category
router.put('/:id', authorize('categories.edit'), categoryController.updateCategory);

// Delete a category
router.delete('/:id', authorize('categories.delete'), categoryController.deleteCategory);

module.exports = router;
