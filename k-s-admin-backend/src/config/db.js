const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ks_enterprise',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

// Simple query function to use throughout the app
const query = async (sql, params = []) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    // Re-throw the error with additional context
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Fallback authentication when database is unavailable
// This is a development-only feature for testing purposes
const localAuth = {
  enabled: process.env.NODE_ENV === 'development',
  users: [
    {
      id: 'user-1',
      name: 'Super Admin',
      email: 'admin@ks-enterprise.com',
      // This is the hashed version of 'admin123'
      password: '$2b$10$mLAMKVatOJKYOf8Tq7MCZ.Y7MVMufE8RIRgbDlk0YQW5PWGxzrCdC',
      role_id: 'role-1',
      role_name: 'Super Admin',
      permissions: ['all'],
      last_login: new Date().toISOString()
    }
  ],

  // Local authentication methods
  getByEmail: async (email) => {
    if (!localAuth.enabled) return null;

    const user = localAuth.users.find(u => u.email === email);
    if (!user) return null;

    return { ...user };
  },

  verifyPassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

module.exports = {
  query,
  pool,
  testConnection,
  localAuth
};
