/**
 * This script fixes the local admin password hash and adds required permissions
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

        // Also update permissions to include content and contact permissions
        // We're looking for permissions: ['all'] and ensuring it stays that way for super admin
        // but we might need to add permissions to other roles
        const permissionsPattern = /permissions: \[\s*(['"]all['"]\s*)\]/;
        let finalContent = updatedContent;

        // Make sure 'all' remains the only permission for super admin
        if (!permissionsPattern.test(finalContent)) {
          // If super admin doesn't have 'all' permission, add it
          finalContent = finalContent.replace(
            /permissions: \[[^\]]*\]/,
            `permissions: ['all']`
          );
        }

        if (content !== finalContent) {
          fs.writeFileSync(filePath, finalContent);
          console.log(`Updated password hash in ${filePath}`);
        } else {
          console.log(`No changes needed in ${filePath}`);
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }

    // Also fix the database.sql file to add content and contact permissions
    const dbSqlPath = path.join(__dirname, 'src/config/database.sql');
    if (fs.existsSync(dbSqlPath)) {
      let dbSqlContent = fs.readFileSync(dbSqlPath, 'utf8');

      // No need to modify this if it already includes contact.view, etc.
      if (!dbSqlContent.includes('contact.view') || !dbSqlContent.includes('content.view')) {
        console.log('Updating database.sql permissions...');

        // Replace the role permissions to include contact and content permissions
        const rolePattern = /(role-1', 'Super Admin', 'Full access to all system features', '\["all"\]')/;
        if (rolePattern.test(dbSqlContent)) {
          console.log('Super admin role already has "all" permissions, no change needed');
        }

        // For other roles, ensure they have the necessary permissions
        let updatedDbSql = dbSqlContent;
        // Admin role
        if (updatedDbSql.includes('role-2')) {
          if (!updatedDbSql.includes('contact.view') || !updatedDbSql.includes('content.view')) {
            updatedDbSql = updatedDbSql.replace(
              /(role-2', 'Admin', '[^']+', '\[)([^\]]+)(\]')/,
              '$1$2, "contact.view", "contact.delete", "content.view", "content.edit"$3'
            );
          }
        }

        // Editor role
        if (updatedDbSql.includes('role-3')) {
          if (!updatedDbSql.includes('contact.view') || !updatedDbSql.includes('content.view')) {
            updatedDbSql = updatedDbSql.replace(
              /(role-3', 'Editor', '[^']+', '\[)([^\]]+)(\]')/,
              '$1$2, "contact.view", "content.view", "content.edit"$3'
            );
          }
        }

        // Viewer role
        if (updatedDbSql.includes('role-4')) {
          if (!updatedDbSql.includes('contact.view') || !updatedDbSql.includes('content.view')) {
            updatedDbSql = updatedDbSql.replace(
              /(role-4', 'Viewer', '[^']+', '\[)([^\]]+)(\]')/,
              '$1$2, "contact.view", "content.view"$3'
            );
          }
        }

        if (dbSqlContent !== updatedDbSql) {
          fs.writeFileSync(dbSqlPath, updatedDbSql);
          console.log('Updated permissions in database.sql');
        }
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
