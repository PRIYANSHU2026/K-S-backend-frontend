const Customer = require('../models/customer.model');

/**
 * Get all customers
 * @route GET /api/customers
 */
const getAllCustomers = async (req, res) => {
  try {
    const { name, email, phone } = req.query;

    // Create filters object from query parameters
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (phone) filters.phone = phone;

    const customers = await Customer.getAll(filters);

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: { customers }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message
    });
  }
};

/**
 * Get a single customer
 * @route GET /api/customers/:id
 */
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.getById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get customer',
      error: error.message
    });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, notes } = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.getById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      phone,
      address,
      notes
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const customer = await Customer.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const result = await Customer.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('active warranties')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer because they have active warranties'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

/**
 * Get warranties by customer
 * @route GET /api/customers/:id/warranties
 */
const getCustomerWarranties = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await Customer.getById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const warranties = await Customer.getWarranties(id);

    return res.status(200).json({
      success: true,
      count: warranties.length,
      data: { warranties }
    });
  } catch (error) {
    console.error('Get customer warranties error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get customer warranties',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerWarranties
};
