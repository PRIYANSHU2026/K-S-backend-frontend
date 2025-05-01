const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Warranty {
  // Get all warranties with optional filtering
  static async getAll(filters = {}) {
    let sql = `
      SELECT w.*,
             p.name as product_name,
             c.name as customer_name,
             c.email as customer_email
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      JOIN customers c ON w.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.product_id) {
      sql += ' AND w.product_id = ?';
      params.push(filters.product_id);
    }

    if (filters.customer_id) {
      sql += ' AND w.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.status) {
      sql += ' AND w.status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      sql += ' AND (p.name LIKE ? OR c.name LIKE ? OR c.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY w.purchase_date DESC';

    return await query(sql, params);
  }

  // Get a single warranty by ID
  static async getById(id) {
    const sql = `
      SELECT w.*,
             p.name as product_name,
             c.name as customer_name,
             c.email as customer_email
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      JOIN customers c ON w.customer_id = c.id
      WHERE w.id = ?
    `;

    const warranties = await query(sql, [id]);

    if (warranties.length === 0) {
      return null;
    }

    return warranties[0];
  }

  // Create a new warranty
  static async create(warrantyData) {
    const id = uuidv4();
    const {
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    } = warrantyData;

    const sql = `
      INSERT INTO warranties (
        id, product_id, customer_id, purchase_date,
        expiry_date, warranty_details, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id,
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status || 'active'
    ]);

    return this.getById(id);
  }

  // Update an existing warranty
  static async update(id, warrantyData) {
    const {
      product_id,
      customer_id,
      purchase_date,
      expiry_date,
      warranty_details,
      status
    } = warrantyData;

    let sql = 'UPDATE warranties SET ';
    const params = [];
    const updates = [];

    if (product_id !== undefined) {
      updates.push('product_id = ?');
      params.push(product_id);
    }

    if (customer_id !== undefined) {
      updates.push('customer_id = ?');
      params.push(customer_id);
    }

    if (purchase_date !== undefined) {
      updates.push('purchase_date = ?');
      params.push(purchase_date);
    }

    if (expiry_date !== undefined) {
      updates.push('expiry_date = ?');
      params.push(expiry_date);
    }

    if (warranty_details !== undefined) {
      updates.push('warranty_details = ?');
      params.push(warranty_details);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Delete a warranty
  static async delete(id) {
    const warranty = await this.getById(id);

    if (!warranty) {
      return false;
    }

    const sql = 'DELETE FROM warranties WHERE id = ?';
    await query(sql, [id]);

    return true;
  }

  // Get expiring warranties
  static async getExpiringWarranties(days = 30) {
    const sql = `
      SELECT w.*,
             p.name as product_name,
             c.name as customer_name,
             c.email as customer_email
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      JOIN customers c ON w.customer_id = c.id
      WHERE w.status = 'active'
      AND DATEDIFF(w.expiry_date, CURDATE()) <= ?
      AND DATEDIFF(w.expiry_date, CURDATE()) >= 0
      ORDER BY w.expiry_date ASC
    `;

    return await query(sql, [days]);
  }

  // Update warranty statuses (e.g., mark expired warranties)
  static async updateStatuses() {
    const sql = `
      UPDATE warranties
      SET status = 'expired'
      WHERE status = 'active'
      AND expiry_date < CURDATE()
    `;

    await query(sql);

    return true;
  }
}

module.exports = Warranty;
