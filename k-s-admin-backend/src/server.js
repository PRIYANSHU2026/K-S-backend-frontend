const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import all routes from the centralized index
const apiRoutes = require('./routes');

// Database initialization
const { initDatabase, pool } = require('./utils/dbInit'); // Make sure pool is exported from dbInit

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
    const [result] = await pool.query('SELECT 1 AS db_status');
    res.json({
      status: 'OK',
      message: 'Server and database are healthy',
      database: result[0].db_status === 1 ? 'Connected' : 'Error',
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
      api: '/api/v1'
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
    // Initialize database
    const dbInitialized = await initDatabase();

    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
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