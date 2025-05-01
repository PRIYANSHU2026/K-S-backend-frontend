const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warranty.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all warranties
router.get('/', authorize('warranties.view'), warrantyController.getAllWarranties);

// Get expiring warranties
router.get('/expiring', authorize('warranties.view'), warrantyController.getExpiringWarranties);

// Update all warranty statuses
router.put('/update-statuses', authorize('warranties.edit'), warrantyController.updateWarrantyStatuses);

// Get a single warranty
router.get('/:id', authorize('warranties.view'), warrantyController.getWarranty);

// Create a new warranty
router.post('/', authorize('warranties.create'), warrantyController.createWarranty);

// Update a warranty
router.put('/:id', authorize('warranties.edit'), warrantyController.updateWarranty);

// Delete a warranty
router.delete('/:id', authorize('warranties.delete'), warrantyController.deleteWarranty);

module.exports = router;
