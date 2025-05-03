const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create connection pool with fallback values
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

/**
 * Initialize the database and create all required tables
 */
const initDatabase = async () => {
  console.log('Checking database connection and initializing if needed...');

  // In development mode, we can continue without a database
  if (process.env.NODE_ENV === 'development') {
    try {
      await testConnection();
      console.log('Database connected successfully');
    } catch (error) {
      console.log('Running in development mode without database. Using in-memory data.');
      return true; // Return true to indicate "initialization" was successful
    }
  }

  let adminConnection;
  let dbConnection;

  try {
    // First, try to connect to MySQL server without specifying a database
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    // Check if database exists, create it if it doesn't
    const dbName = process.env.DB_NAME || 'ks_enterprise';
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' confirmed or created.`);

    // Close admin connection
    await adminConnection.end();

    // Connect to the specific database
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ks_enterprise',
      port: process.env.DB_PORT || 3306
    });

    // Read SQL schema file
    const schemaPath = path.join(__dirname, '../config/database.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL file into individual statements
    const statements = schemaSql
      .replace(/(\r\n|\n|\r)/gm, ' ') // Remove newlines
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(';') // Split on semicolons
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0); // Remove empty statements

    // Execute each statement
    for (const statement of statements) {
      try {
        await dbConnection.query(statement);
      } catch (error) {
        // Skip "table already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('Database schema initialized successfully.');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);

    // In development mode, don't fail even if database initialization fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode without database');
      return true;
    }

    return false;
  } finally {
    if (adminConnection) await adminConnection.end();
    if (dbConnection) await dbConnection.end();
  }
};

/**
 * Test database connection
 */
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

/**
 * Execute SQL queries
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);

    // If in development mode and we have a fallback, return an empty result
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: returning mock data for query');
      return [];
    }

    // Re-throw the error with additional context
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Fallback authentication data for development
const localAuth = {
  enabled: process.env.NODE_ENV === 'development',
  users: [
    {
      id: 'user-1',
      name: 'Super Admin',
      email: 'admin@ks-enterprise.com',
      // This is the hashed version of 'admin123'
      password: '$2b$10$PdVMFcqZRRzCSvYvs3GAy.y0kXRNElzW6rvMpuBYWcIKecKutU2x6',
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

module.exports = {
  pool,           // The connection pool for regular queries
  query,          // Function to execute queries
  initDatabase,   // Function to initialize the database
  testConnection, // Function to test the connection
  localAuth       // Local authentication fallback
};
