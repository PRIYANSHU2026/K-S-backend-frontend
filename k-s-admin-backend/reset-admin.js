/**
 * This script resets the admin password in the database
 * Run with: node reset-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const resetAdmin = async () => {
  try {
    console.log('Connecting to database...');

    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ks_enterprise',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database successfully.');

    // Check if the admin user exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@ks-enterprise.com']
    );

    // Generate hash for 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (rows.length === 0) {
      // Admin user doesn't exist, check if roles table has the Super Admin role
      const [roles] = await connection.execute(
        'SELECT * FROM roles WHERE name = ?',
        ['Super Admin']
      );

      let roleId = 'role-1';

      if (roles.length === 0) {
        // Create Super Admin role if it doesn't exist
        console.log('Creating Super Admin role...');
        await connection.execute(
          'INSERT INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)',
          ['role-1', 'Super Admin', 'Full access to all system features', JSON.stringify(['all'])]
        );
      } else {
        roleId = roles[0].id;
      }

      // Create admin user
      console.log('Creating new admin user...');
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role_id) VALUES (?, ?, ?, ?, ?)',
        ['user-1', 'Super Admin', 'admin@ks-enterprise.com', hashedPassword, roleId]
      );

      console.log('Admin user created successfully.');
    } else {
      // Update existing admin user's password
      console.log('Updating admin password...');
      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@ks-enterprise.com']
      );

      console.log('Admin password updated successfully.');
    }

    console.log('\nAdmin credentials:');
    console.log('Email: admin@ks-enterprise.com');
    console.log('Password: admin123');

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

resetAdmin();
