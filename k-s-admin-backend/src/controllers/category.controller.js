const Category = require('../models/category.model');

/**
 * Get all categories
 * @route GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

/**
 * Get a single category
 * @route GET /api/categories/:id
 */
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.getById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
};

/**
 * Create a new category
 * @route POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const category = await Category.create({
      name,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

/**
 * Update a category
 * @route PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const category = await Category.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const result = await Category.delete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('associated products')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category because it has associated products'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

/**
 * Get products by category
 * @route GET /api/categories/:id/products
 */
const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await Category.getProducts(id);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Get category products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category products',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts
};
