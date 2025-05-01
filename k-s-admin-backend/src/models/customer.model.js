const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Customer {
  // Get all customers with optional filtering
  static async getAll(filters = {}) {
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      sql += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.phone) {
      sql += ' AND phone LIKE ?';
      params.push(`%${filters.phone}%`);
    }

    sql += ' ORDER BY name ASC';

    return await query(sql, params);
  }

  // Get a single customer by ID
  static async getById(id) {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const customers = await query(sql, [id]);

    if (customers.length === 0) {
      return null;
    }

    return customers[0];
  }

  // Create a new customer
  static async create(customerData) {
    const id = uuidv4();
    const { name, email, phone, address, notes } = customerData;

    const sql = `
      INSERT INTO customers (id, name, email, phone, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [id, name, email, phone, address, notes]);

    return this.getById(id);
  }

  // Update an existing customer
  static async update(id, customerData) {
    const { name, email, phone, address, notes } = customerData;

    let sql = 'UPDATE customers SET ';
    const params = [];
    const updates = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Delete a customer
  static async delete(id) {
    const customer = await this.getById(id);

    if (!customer) {
      return false;
    }

    // Check if there are any warranties associated with this customer
    const checkSql = 'SELECT COUNT(*) as count FROM warranties WHERE customer_id = ?';
    const result = await query(checkSql, [id]);

    if (result[0].count > 0) {
      throw new Error('Cannot delete customer because they have active warranties');
    }

    const sql = 'DELETE FROM customers WHERE id = ?';
    await query(sql, [id]);

    return true;
  }

  // Get warranties by customer
  static async getWarranties(customerId) {
    const sql = `
      SELECT w.*, p.name as product_name
      FROM warranties w
      JOIN products p ON w.product_id = p.id
      WHERE w.customer_id = ?
      ORDER BY w.purchase_date DESC
    `;

    return await query(sql, [customerId]);
  }
}

module.exports = Customer;
