/**
 * Development Environment Setup Script
 *
 * This script creates a development setup with fallback local authentication
 * so you can run the application without a database.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Set the NODE_ENV to development in the .env file
const updateEnvFile = () => {
  try {
    let envContent = '';
    const envPath = path.join(__dirname, '.env');

    // Read existing .env file or create a new one from .env.example
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(path.join(__dirname, '.env.example'))) {
      envContent = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    }

    // Make sure NODE_ENV is set to development
    if (envContent.includes('NODE_ENV=')) {
      envContent = envContent.replace(/NODE_ENV=.*/g, 'NODE_ENV=development');
    } else {
      envContent += '\nNODE_ENV=development';
    }

    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Updated .env file with NODE_ENV=development');
    return true;
  } catch (error) {
    console.error('❌ Failed to update .env file:', error);
    return false;
  }
};

// Create uploads directory if it doesn't exist
const createUploadsDir = () => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || 'public/uploads';
    const fullUploadDir = path.join(__dirname, uploadDir);

    if (!fs.existsSync(fullUploadDir)) {
      fs.mkdirSync(fullUploadDir, { recursive: true });
    }

    console.log(`✅ Created uploads directory at ${fullUploadDir}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create uploads directory:', error);
    return false;
  }
};

// Run all setup tasks
const runSetup = () => {
  console.log('==== Running Development Environment Setup ====');

  const tasks = [
    { name: 'Update .env file', fn: updateEnvFile },
    { name: 'Create uploads directory', fn: createUploadsDir },
  ];

  let success = true;
  for (const task of tasks) {
    const result = task.fn();
    if (!result) success = false;
  }

  if (success) {
    console.log('\n✅ Development environment setup complete!');
    console.log('\nYou can now start the server with:');
    console.log('  bun run dev');
    console.log('\nDefault admin credentials:');
    console.log('  Email: admin@ks-enterprise.com');
    console.log('  Password: admin123');
  } else {
    console.log('\n❌ Development environment setup had some issues.');
    console.log('Please check the logs above and fix any errors before running the server.');
  }

  console.log('\n=============================================');
};

// Run the setup
runSetup();
