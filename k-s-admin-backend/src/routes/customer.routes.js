const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all customers
router.get('/', authorize('customers.view'), customerController.getAllCustomers);

// Get a single customer
router.get('/:id', authorize('customers.view'), customerController.getCustomer);

// Get warranties by customer
router.get('/:id/warranties', authorize('customers.view'), customerController.getCustomerWarranties);

// Create a new customer
router.post('/', authorize('customers.create'), customerController.createCustomer);

// Update a customer
router.put('/:id', authorize('customers.edit'), customerController.updateCustomer);

// Delete a customer
router.delete('/:id', authorize('customers.delete'), customerController.deleteCustomer);

module.exports = router;
