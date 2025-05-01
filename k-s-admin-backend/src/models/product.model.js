const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Product {
  // Get all products with optional filtering
  static async getAll(filters = {}) {
    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.name) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.category_id) {
      sql += ' AND p.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.in_stock !== undefined) {
      sql += ' AND p.in_stock = ?';
      params.push(filters.in_stock);
    }

    sql += ' ORDER BY p.created_at DESC';

    const products = await query(sql, params);

    // Parse JSON fields
    return products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {}
    }));
  }

  // Get a single product by ID
  static async getById(id) {
    const sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const products = await query(sql, [id]);

    if (products.length === 0) {
      return null;
    }

    const product = products[0];

    // Parse JSON fields
    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {}
    };
  }

  // Create a new product
  static async create(productData) {
    const id = uuidv4();
    const {
      name,
      description,
      price,
      images,
      category_id,
      features,
      specifications,
      in_stock,
      sku
    } = productData;

    const sql = `
      INSERT INTO products (
        id, name, description, price, images, category_id,
        features, specifications, in_stock, sku
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      name,
      description,
      price,
      images ? JSON.stringify(images) : null,
      category_id,
      features ? JSON.stringify(features) : null,
      specifications ? JSON.stringify(specifications) : null,
      in_stock !== undefined ? in_stock : true,
      sku
    ];

    await query(sql, params);

    return this.getById(id);
  }

  // Update an existing product
  static async update(id, productData) {
    const {
      name,
      description,
      price,
      images,
      category_id,
      features,
      specifications,
      in_stock,
      sku
    } = productData;

    let sql = 'UPDATE products SET ';
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

    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }

    if (images !== undefined) {
      updates.push('images = ?');
      params.push(JSON.stringify(images));
    }

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }

    if (features !== undefined) {
      updates.push('features = ?');
      params.push(JSON.stringify(features));
    }

    if (specifications !== undefined) {
      updates.push('specifications = ?');
      params.push(JSON.stringify(specifications));
    }

    if (in_stock !== undefined) {
      updates.push('in_stock = ?');
      params.push(in_stock);
    }

    if (sku !== undefined) {
      updates.push('sku = ?');
      params.push(sku);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Delete a product
  static async delete(id) {
    const product = await this.getById(id);

    if (!product) {
      return false;
    }

    const sql = 'DELETE FROM products WHERE id = ?';
    await query(sql, [id]);

    return true;
  }
}

module.exports = Product;
