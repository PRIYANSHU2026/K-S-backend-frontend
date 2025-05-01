const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadProductImage, handleUploadError } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(authenticate);

// Get all products
router.get('/', authorize('products.view'), productController.getAllProducts);

// Get a single product
router.get('/:id', authorize('products.view'), productController.getProduct);

// Create a new product
router.post(
  '/',
  authorize('products.create'),
  uploadProductImage.array('images', 10), // Allow up to 10 images
  handleUploadError,
  productController.createProduct
);

// Update a product
router.put(
  '/:id',
  authorize('products.edit'),
  uploadProductImage.array('images', 10),
  handleUploadError,
  productController.updateProduct
);

// Delete a product
router.delete('/:id', authorize('products.delete'), productController.deleteProduct);

module.exports = router;
