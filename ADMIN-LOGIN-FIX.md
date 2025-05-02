# K-S Enterprise Admin Login Fix

This document provides instructions on how to fix the admin login authentication issue.

## Admin Credentials

The default admin credentials are:
- **Email**: admin@ks-enterprise.com
- **Password**: admin123

## Fix Methods

### Option 1: Run the Fix Script (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd k-s-admin-backend
   ```

2. Run the fix script:
   ```bash
   node fix-local-admin.js
   ```

3. Restart the server:
   ```bash
   npm start
   ```

### Option 2: Manual Fix

If the script doesn't work, you can manually update the admin password:

1. Open the following files:
   - `k-s-admin-backend/src/config/db.js`
   - `k-s-admin-backend/src/utils/dbInit.js`

2. In each file, find the `localAuth` object and update the password hash with a fresh one.

3. To generate a new hash for the password "admin123", you can run:
   ```javascript
   const bcrypt = require('bcrypt');
   bcrypt.hash('admin123', 10).then(hash => console.log(hash));
   ```

4. Replace the existing hash in the files with the new one.

### Option 3: Fix Database User

If you're using a database, you can reset the admin user:

1. Run the database reset script:
   ```bash
   node reset-admin.js
   ```

## Troubleshooting

If you still can't log in:

1. Make sure you're using the correct email: `admin@ks-enterprise.com`
2. Make sure you're using the correct password: `admin123`
3. Check console logs for any errors
4. Verify that the server is running in development mode (`NODE_ENV=development`)
5. Try clearing your browser cache and cookies

## How the Local Authentication Works

In development mode, the system uses a fallback authentication mechanism when the database is not available or when authentication fails. This is implemented in:

- `src/controllers/auth.controller.js`: The login logic
- `src/config/db.js` and `src/utils/dbInit.js`: The local authentication data

The system will first try to authenticate against the database. If that fails, it will fall back to local authentication.
