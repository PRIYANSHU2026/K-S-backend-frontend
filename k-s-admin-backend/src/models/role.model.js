const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Role {
  // Get all roles
  static async getAll() {
    const sql = 'SELECT * FROM roles ORDER BY name ASC';
    const roles = await query(sql);

    // Parse permissions JSON
    return roles.map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : []
    }));
  }

  // Get a single role by ID
  static async getById(id) {
    const sql = 'SELECT * FROM roles WHERE id = ?';
    const roles = await query(sql, [id]);

    if (roles.length === 0) {
      return null;
    }

    const role = roles[0];

    // Parse permissions JSON
    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : []
    };
  }

  // Create a new role
  static async create(roleData) {
    const id = uuidv4();
    const { name, description, permissions } = roleData;

    const sql = 'INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)';
    const permissionsJson = permissions ? JSON.stringify(permissions) : '[]';

    await query(sql, [id, name, description, permissionsJson]);

    return this.getById(id);
  }

  // Update an existing role
  static async update(id, roleData) {
    const { name, description, permissions } = roleData;

    let sql = 'UPDATE roles SET ';
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

    if (permissions !== undefined) {
      updates.push('permissions = ?');
      params.push(JSON.stringify(permissions));
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await query(sql, params);

    return this.getById(id);
  }

  // Delete a role
  static async delete(id) {
    // Check if this is the Super Admin role, which should not be deleted
    const role = await this.getById(id);

    if (!role) {
      return false;
    }

    if (role.name === 'Super Admin') {
      throw new Error('The Super Admin role cannot be deleted');
    }

    // Check if there are users assigned to this role
    const checkSql = 'SELECT COUNT(*) as count FROM users WHERE role_id = ?';
    const result = await query(checkSql, [id]);

    if (result[0].count > 0) {
      throw new Error('Cannot delete role because there are users assigned to it');
    }

    const sql = 'DELETE FROM roles WHERE id = ?';
    await query(sql, [id]);

    return true;
  }

  // Get users by role
  static async getUsers(roleId) {
    const sql = `
      SELECT id, name, email, avatar, last_login
      FROM users
      WHERE role_id = ?
      ORDER BY name ASC
    `;

    return await query(sql, [roleId]);
  }

  // Get available permissions
  static async getAvailablePermissions() {
    // This is a static list of all possible permissions in the system
    return [
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'categories.view',
      'categories.create',
      'categories.edit',
      'categories.delete',
      'customers.view',
      'customers.create',
      'customers.edit',
      'customers.delete',
      'warranties.view',
      'warranties.create',
      'warranties.edit',
      'warranties.delete',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'roles.view',
      'roles.create',
      'roles.edit',
      'roles.delete'
    ];
  }
}

module.exports = Role;
