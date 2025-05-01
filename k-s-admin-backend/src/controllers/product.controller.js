const Product = require('../models/product.model');
const Category = require('../models/category.model');

/**
 * Get all products
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const { name, category_id, in_stock } = req.query;

    // Create filters object from query parameters
    const filters = {};
    if (name) filters.name = name;
    if (category_id) filters.category_id = category_id;
    if (in_stock !== undefined) filters.in_stock = in_stock === 'true';

    const products = await Product.getAll(filters);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
};

/**
 * Get a single product
 * @route GET /api/products/:id
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
};

/**
 * Create a new product
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      features,
      specifications,
      in_stock,
      sku
    } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Validate category exists
    const category = await Category.getById(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get file paths from upload middleware
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Create relative path for client to access
        return `/uploads/products/${file.filename}`;
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      images,
      category_id,
      features: features ? JSON.parse(features) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
      in_stock: in_stock !== undefined ? in_stock : true,
      sku
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      features,
      specifications,
      in_stock,
      sku
    } = req.body;

    // Check if product exists
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If category_id is provided, validate it exists
    if (category_id) {
      const category = await Category.getById(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Handle file uploads
    let images = undefined;
    if (req.files && req.files.length > 0) {
      // If new images are uploaded, replace existing ones
      images = req.files.map(file => {
        return `/uploads/products/${file.filename}`;
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      price,
      category_id,
      images,
      features: features ? JSON.parse(features) : undefined,
      specifications: specifications ? JSON.parse(specifications) : undefined,
      in_stock: in_stock !== undefined ? in_stock : undefined,
      sku
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const product = await Product.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Product.delete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
