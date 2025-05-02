/**
 * This script fixes the local admin password hash
 * Run with: node fix-local-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const fixLocalAdmin = async () => {
  try {
    console.log('Fixing local admin password...');

    // Files to check and fix
    const filesToFix = [
      path.join(__dirname, 'src/config/db.js'),
      path.join(__dirname, 'src/utils/dbInit.js')
    ];

    // Generate fresh hash for 'admin123'
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Generated new password hash for admin123.');

    for (const filePath of filesToFix) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the existing password hash with the new one
        // Look for the pattern: password: '$2b$10$...', in the localAuth section
        const pattern = /password: '\$2b\$10\$[^']+'/;
        const updatedContent = content.replace(pattern, `password: '${hashedPassword}'`);

        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(`Updated password hash in ${filePath}`);
        } else {
          console.log(`No changes needed in ${filePath}`);
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }

    console.log('\nAdmin credentials:');
    console.log('Email: admin@ks-enterprise.com');
    console.log('Password: admin123');
    console.log('\nThe local authentication hash has been updated.');
  } catch (error) {
    console.error('Error:', error);
  }
};

fixLocalAdmin();
