const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import all routes from the centralized index
const apiRoutes = require('./routes');

// Database initialization
const { initDatabase, pool, testConnection } = require('./utils/dbInit');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check Endpoint (add this before the API routes)
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    res.json({
      status: 'OK',
      message: dbConnected
        ? 'Server and database are healthy'
        : 'Server is healthy, but database is not connected',
      database: dbConnected ? 'Connected' : 'Disconnected',
      mode: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to K-S Enterprise Admin API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      api: '/api'
    }
  });
});

// 404 Handler (add this before the error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server function
const startServer = async () => {
  try {
    let dbInitialized = false;

    // Try to initialize database
    try {
      dbInitialized = await initDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);

      // In development mode, continue even if database init fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Running in development mode without database connection.');
        dbInitialized = true; // Pretend it's initialized for development
      } else {
        console.error('Failed to initialize database in production mode. Exiting...');
        process.exit(1);
      }
    }

    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
