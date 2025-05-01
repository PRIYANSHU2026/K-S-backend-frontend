const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

  let adminConnection;
  let dbConnection;

  try {
    // First, try to connect to MySQL server without specifying a database
    adminConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    // Check if database exists, create it if it doesn't
    const dbName = process.env.DB_NAME;
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' confirmed or created.`);

    // Close admin connection
    await adminConnection.end();

    // Connect to the specific database
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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

module.exports = {
  pool,           // The connection pool for regular queries
  initDatabase,   // Function to initialize the database
  testConnection  // Function to test the connection
};