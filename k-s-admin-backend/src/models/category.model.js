const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Category {
  // Get all categories
  static async getAll() {
    const sql = `
      SELECT * FROM categories
      ORDER BY name ASC
    `;
    return await query(sql);
  }

  // Get a single category by ID
  static async getById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const categories = await query(sql, [id]);

    if (categories.length === 0) {
      return null;
    }

    return categories[0];
  }

  // Create a new category
  static async create(categoryData) {
    const id = uuidv4();
    const { name, description } = categoryData;

    const sql = 'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)';
    await query(sql, [id, name, description]);

    return this.getById(id);
  }

  // Update an existing category
  static async update(id, categoryData) {
    const { name, description } = categoryData;

    let sql = 'UPDATE categories SET ';
    const params = [];
    const updates = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Delete a category
  static async delete(id) {
    const category = await this.getById(id);

    if (!category) {
      return false;
    }

    // Check if there are any products associated with this category
    const checkSql = 'SELECT COUNT(*) as count FROM products WHERE category_id = ?';
    const result = await query(checkSql, [id]);

    if (result[0].count > 0) {
      throw new Error('Cannot delete category because it has associated products');
    }

    const sql = 'DELETE FROM categories WHERE id = ?';
    await query(sql, [id]);

    return true;
  }

  // Get products by category
  static async getProducts(categoryId) {
    const sql = `
      SELECT p.*
      FROM products p
      WHERE p.category_id = ?
      ORDER BY p.name ASC
    `;

    const products = await query(sql, [categoryId]);

    // Parse JSON fields
    return products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {}
    }));
  }
}

module.exports = Category;
