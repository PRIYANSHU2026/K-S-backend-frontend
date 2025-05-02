const { query, localAuth, testConnection } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class User {
  // Get all users with optional filtering
  static async getAll(filters = {}) {
    const dbConnected = await testConnection();

    // Fallback to local users in development mode if database is not available
    if (!dbConnected && process.env.NODE_ENV === 'development') {
      console.log('Using local user data for getAll');
      return localAuth.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }

    let sql = `
      SELECT u.id, u.name, u.email, u.avatar, u.last_login, r.name as role_name, r.id as role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      sql += ' AND u.name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      sql += ' AND u.email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.role_id) {
      sql += ' AND u.role_id = ?';
      params.push(filters.role_id);
    }

    sql += ' ORDER BY u.name ASC';

    return await query(sql, params);
  }

  // Get a single user by ID
  static async getById(id) {
    const dbConnected = await testConnection();

    // Fallback to local user in development mode if database is not available
    if (!dbConnected && process.env.NODE_ENV === 'development') {
      console.log(`Using local user data for getById(${id})`);
      const user = localAuth.users.find(u => u.id === id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    }

    const sql = `
      SELECT u.id, u.name, u.email, u.avatar, u.last_login, r.name as role_name, r.id as role_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const users = await query(sql, [id]);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  // Get a user by email
  static async getByEmail(email) {
    const dbConnected = await testConnection();

    // Fallback to local user in development mode if database is not available
    if (!dbConnected && process.env.NODE_ENV === 'development') {
      console.log(`Using local user data for getByEmail(${email})`);
      return await localAuth.getByEmail(email);
    }

    const sql = `
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `;
    const users = await query(sql, [email]);

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    return {
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    };
  }

  // Create a new user
  static async create(userData) {
    const dbConnected = await testConnection();

    // Fail in development mode if database is not available
    if (!dbConnected) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Cannot create user: Database not connected');
        throw new Error('Cannot create user: Database not connected');
      }
    }

    const id = uuidv4();
    const { name, email, password, role_id, avatar } = userData;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (id, name, email, password, role_id, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [id, name, email, hashedPassword, role_id, avatar]);

    return this.getById(id);
  }

  // Update an existing user
  static async update(id, userData) {
    const dbConnected = await testConnection();

    // Fail in development mode if database is not available
    if (!dbConnected) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Cannot update user: Database not connected');
        throw new Error('Cannot update user: Database not connected');
      }
    }

    const { name, email, password, role_id, avatar } = userData;

    let sql = 'UPDATE users SET ';
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

    if (password !== undefined) {
      updates.push('password = ?');
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
    }

    if (role_id !== undefined) {
      updates.push('role_id = ?');
      params.push(role_id);
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Update last login timestamp
  static async updateLastLogin(id) {
    const dbConnected = await testConnection();

    // Skip in development mode if database is not available
    if (!dbConnected && process.env.NODE_ENV === 'development') {
      console.log(`Skipping updateLastLogin for user ${id} (no database connection)`);
      return;
    }

    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [id]);
  }

  // Delete a user
  static async delete(id) {
    const dbConnected = await testConnection();

    // Fail in development mode if database is not available
    if (!dbConnected) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Cannot delete user: Database not connected');
        throw new Error('Cannot delete user: Database not connected');
      }
    }

    const user = await this.getById(id);

    if (!user) {
      return false;
    }

    // Don't delete the last super admin
    if (user.role_name === 'Super Admin') {
      const superAdmins = await query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'Super Admin'
      `);

      if (superAdmins[0].count <= 1) {
        throw new Error('Cannot delete the last Super Admin user');
      }
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);

    return true;
  }

  // Verify a password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if user has a specific permission
  static async hasPermission(userId, permission) {
    const dbConnected = await testConnection();

    // Fallback to local permissions in development mode if database is not available
    if (!dbConnected && process.env.NODE_ENV === 'development') {
      console.log(`Using local permission check for user ${userId} and permission ${permission}`);
      const user = localAuth.users.find(u => u.id === userId);

      if (!user) return false;

      // Super admin has all permissions
      if (user.role_name === 'Super Admin') return true;

      // Check specific permission
      return user.permissions &&
             (user.permissions.includes('all') ||
              user.permissions.includes(permission));
    }

    const user = await query(`
      SELECT r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    if (user.length === 0) {
      return false;
    }

    const permissions = JSON.parse(user[0].permissions || '[]');

    return permissions.includes('all') || permissions.includes(permission);
  }
}

module.exports = User;
