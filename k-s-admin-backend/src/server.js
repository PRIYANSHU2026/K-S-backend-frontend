const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./utils/dbInit');
require('dotenv').config();

// Import routes
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../', process.env.UPLOAD_DIR || 'public/uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize database and routes
const startServer = async () => {
  try {
    // Initialize database
    console.log('Checking database connection and initializing if needed...');
    await initDatabase();

    // Setup routes
    app.use('/api', routes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);

      // Display default credentials in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== Development Mode ===');
        console.log('Default Admin Credentials:');
        console.log('Email: admin@ks-enterprise.com');
        console.log('Password: admin123');
        console.log('===========================\n');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
