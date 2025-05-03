/**
 * This script updates the database schema to include new tables
 * Run with: node update-db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const updateDatabase = async () => {
  try {
    console.log('Updating database schema...');

    // Database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ks_enterprise',
      multipleStatements: true, // Important for running multiple SQL statements
    });

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'src/config/update-tables.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('SQL file read successfully');

    // Execute SQL statements
    console.log('Executing SQL statements...');
    try {
      await connection.query(sql);
      console.log('Database schema updated successfully');
    } catch (sqlError) {
      console.error('SQL Error:', sqlError.message);
      console.error('SQL Error Code:', sqlError.code);

      // Special case for duplicate entry errors which are acceptable
      if (sqlError.code === 'ER_DUP_ENTRY') {
        console.log('Ignoring duplicate entry error - content may already exist');
      } else {
        throw sqlError;
      }
    }

    // Close connection
    await connection.end();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Database update error:', error);
    console.log('\nNote: If you\'re in development mode without a MySQL database, this error can be ignored.');
    console.log('The application will use the in-memory data store instead.');
  }
};

updateDatabase();
