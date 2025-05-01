const Warranty = require('../models/warranty.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');

/**
 * Get all warranties
 * @route GET /api/warranties
 */
const getAllWarranties = async (req, res) => {
  try {
    const { product_id, customer_id, status, search } = req.query;

    // Create filters object from query parameters
    const filters = {};
    if (product_id) filters.product_id = product_id;
    if (customer_id) filters.customer_id = customer_id;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const warranties = await Warranty.getAll(filters);

    return res.status(200).json({
      success: true,
      count: warranties.length,
      data: { warranties }
    });
  } catch (error) {
    console.error('Get warranties error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get warranties',
      error: error.message
    });
  }
};

/**
 * Get a single warranty
 * @route GET /api/warranties/:id
 */
const getWarranty = async (req, res) => {
  try {
    const { id } = req.params;

    const warranty = await Warranty.getById(id);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { warranty }
    });
  } catch (error) {
    console.error('Get warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get warranty',
      error: error.message
    });
  }
};

/**
 * Create a new warranty
 * @route POST /api/warranties
 */
const createWarranty = async (req, res) => {
  try {
    const {
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    } = req.body;

    // Validate required fields
    if (!product_id || !customer_id || !purchase_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Product, customer, purchase date, and expiry date are required'
      });
    }

    // Validate product exists
    const product = await Product.getById(product_id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate customer exists
    const customer = await Customer.getById(customer_id);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const warranty = await Warranty.create({
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Warranty created successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Create warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create warranty',
      error: error.message
    });
  }
};

/**
 * Update a warranty
 * @route PUT /api/warranties/:id
 */
const updateWarranty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    } = req.body;

    // Check if warranty exists
    const existingWarranty = await Warranty.getById(id);
    if (!existingWarranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found'
      });
    }

    // If product_id is provided, validate it exists
    if (product_id) {
      const product = await Product.getById(product_id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }
    }

    // If customer_id is provided, validate it exists
    if (customer_id) {
      const customer = await Customer.getById(customer_id);
      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    // Prepare update data
    const updateData = {
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const warranty = await Warranty.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Warranty updated successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Update warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update warranty',
      error: error.message
    });
  }
};

/**
 * Delete a warranty
 * @route DELETE /api/warranties/:id
 */
const deleteWarranty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Warranty.delete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Warranty deleted successfully'
    });
  } catch (error) {
    console.error('Delete warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete warranty',
      error: error.message
    });
  }
};

/**
 * Get expiring warranties
 * @route GET /api/warranties/expiring
 */
const getExpiringWarranties = async (req, res) => {
  try {
    const { days } = req.query;

    const warranties = await Warranty.getExpiringWarranties(days ? parseInt(days) : 30);

    return res.status(200).json({
      success: true,
      count: warranties.length,
      data: { warranties }
    });
  } catch (error) {
    console.error('Get expiring warranties error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get expiring warranties',
      error: error.message
    });
  }
};

/**
 * Update warranty statuses (mark expired ones)
 * @route PUT /api/warranties/update-statuses
 */
const updateWarrantyStatuses = async (req, res) => {
  try {
    await Warranty.updateStatuses();

    return res.status(200).json({
      success: true,
      message: 'Warranty statuses updated successfully'
    });
  } catch (error) {
    console.error('Update warranty statuses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update warranty statuses',
      error: error.message
    });
  }
};

module.exports = {
  getAllWarranties,
  getWarranty,
  createWarranty,
  updateWarranty,
  deleteWarranty,
  getExpiringWarranties,
  updateWarrantyStatuses
};
