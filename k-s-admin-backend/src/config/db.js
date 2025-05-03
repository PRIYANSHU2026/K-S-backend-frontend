const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ks_enterprise',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

// Simple query function to use throughout the app
const query = async (sql, params = []) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    // Re-throw the error with additional context
    throw new Error(`Database query failed: ${error.message}`);
  }
};

// Fallback authentication when database is unavailable
// This is a development-only feature for testing purposes
const localAuth = {
  enabled: process.env.NODE_ENV === 'development',
  users: [
    {
      id: 'user-1',
      name: 'Super Admin',
      email: 'admin@ks-enterprise.com',
      // This is the hashed version of 'admin123'
      password: '$2b$10$2UT5dbwMBHRZdKtWBtgNmumccbDa/6fi6tyu6L7HfPSvreUHd2Jli',
      role_id: 'role-1',
      role_name: 'Super Admin',
      permissions: ['all', 'products.view', 'products.edit', 'customers.view', 'customers.edit',
                   'contact.view', 'contact.delete', 'content.view', 'content.edit'],
      last_login: new Date().toISOString()
    }
  ],

  // Sample data for development
  content: [
    {
      id: 'content-1',
      section: 'about_us',
      title: 'About K-S Enterprise',
      content: '<p>K-S Enterprise is a leading provider of high-quality garden tools, forest equipment, and maintenance solutions. With over 15 years of experience in the industry, we pride ourselves on delivering exceptional products and service to our customers.</p><p>Our mission is to provide innovative and reliable tools that make outdoor work easier and more efficient. We believe in sustainable practices and offering products that are built to last.</p>',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'content-2',
      section: 'home_banner',
      title: 'Quality Garden & Forest Tools',
      content: '<p>Discover our premium range of garden and forest equipment</p>',
      metadata: { button_text: 'Shop Now', button_link: '/products' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'content-3',
      section: 'contact_info',
      title: 'Contact Information',
      content: '<p>Our customer service team is available to help you with any inquiries.</p>',
      metadata: {
        address: '123 Main Street, Bangalore, Karnataka, India - 560001',
        phone: '9845019069, 7760093353, 9480453271',
        email: 'info@ksenterprises.com'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  contact_submissions: [],

  // Local authentication methods
  getByEmail: async (email) => {
    if (!localAuth.enabled) return null;

    const user = localAuth.users.find(u => u.email === email);
    if (!user) return null;

    return { ...user };
  },

  verifyPassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Content methods for local development
  getAllContent: async () => {
    return [...localAuth.content];
  },

  getContentBySection: async (section) => {
    return localAuth.content.find(c => c.section === section) || null;
  },

  getContentById: async (id) => {
    return localAuth.content.find(c => c.id === id) || null;
  },

  createContent: async (data) => {
    const newContent = {
      id: `content-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localAuth.content.push(newContent);
    return newContent;
  },

  updateContent: async (id, data) => {
    const index = localAuth.content.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedContent = {
      ...localAuth.content[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    localAuth.content[index] = updatedContent;
    return updatedContent;
  },

  deleteContent: async (id) => {
    const index = localAuth.content.findIndex(c => c.id === id);
    if (index === -1) return null;

    const deletedContent = localAuth.content[index];
    localAuth.content.splice(index, 1);
    return deletedContent;
  },

  // Contact form methods for local development
  submitContactForm: async (data) => {
    const newSubmission = {
      id: `contact-${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    localAuth.contact_submissions.push(newSubmission);
    return newSubmission;
  },

  getAllContactSubmissions: async (limit = 100, offset = 0) => {
    return {
      submissions: localAuth.contact_submissions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + limit),
      pagination: {
        total: localAuth.contact_submissions.length,
        page: Math.floor(offset / limit) + 1,
        limit,
        pages: Math.ceil(localAuth.contact_submissions.length / limit)
      }
    };
  },

  getContactSubmissionById: async (id) => {
    return localAuth.contact_submissions.find(s => s.id === id) || null;
  },

  deleteContactSubmission: async (id) => {
    const index = localAuth.contact_submissions.findIndex(s => s.id === id);
    if (index === -1) return null;

    const deletedSubmission = localAuth.contact_submissions[index];
    localAuth.contact_submissions.splice(index, 1);
    return deletedSubmission;
  }
};

// Test database connection
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
  query,
  pool,
  testConnection,
  localAuth
};
