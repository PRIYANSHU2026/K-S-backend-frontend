/**
 * This script sets up the database and its tables
 * Run with: node setup-db.js
 */

require('dotenv').config();
const { initDatabase } = require('./src/utils/dbInit');

const setup = async () => {
  try {
    console.log('Setting up the database...');
    const result = await initDatabase();

    if (result) {
      console.log('Database setup completed successfully!');
      console.log('\nDefault admin credentials:');
      console.log('Email: admin@ks-enterprise.com');
      console.log('Password: admin123');
      console.log('\nNOTE: Change the default password after first login.');
    } else {
      console.error('Database setup failed. Check your database configuration.');
    }
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    process.exit();
  }
};

setup();
