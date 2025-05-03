const ContactFormSubmission = require('../models/contact.model');
const { testConnection, localAuth } = require('../config/db');

// Submit a new contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      });
    }

    // Check database connection
    const dbConnected = await testConnection();
    let submission;

    if (dbConnected) {
      submission = await ContactFormSubmission.create({
        user_name: name,
        user_email: email,
        user_phone: phone || null,
        subject: subject || 'General Inquiry',
        message
      });
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local contact form submission');
      submission = await localAuth.submitContactForm({
        user_name: name,
        user_email: email,
        user_phone: phone || null,
        subject: subject || 'General Inquiry',
        message
      });
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// Get all contact form submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check database connection
    const dbConnected = await testConnection();
    let result;

    if (dbConnected) {
      const submissions = await ContactFormSubmission.findAll(limit, offset);
      const total = await ContactFormSubmission.count();

      result = {
        submissions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local contact form submissions');
      result = await localAuth.getAllContactSubmissions(limit, offset);
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching contact form submissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact form submissions',
      error: error.message
    });
  }
};

// Get a single contact form submission by ID (admin only)
exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check database connection
    const dbConnected = await testConnection();
    let submission;

    if (dbConnected) {
      submission = await ContactFormSubmission.findById(id);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local contact form submission');
      submission = await localAuth.getContactSubmissionById(id);
    } else {
      throw new Error('Database connection failed');
    }

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact form submission not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching contact form submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact form submission',
      error: error.message
    });
  }
};

// Delete a contact form submission (admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    // Check database connection
    const dbConnected = await testConnection();
    let submission;

    if (dbConnected) {
      submission = await ContactFormSubmission.findById(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Contact form submission not found'
        });
      }

      await ContactFormSubmission.delete(id);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local contact form submission');
      submission = await localAuth.getContactSubmissionById(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Contact form submission not found'
        });
      }

      await localAuth.deleteContactSubmission(id);
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(200).json({
      success: true,
      message: 'Contact form submission deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting contact form submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact form submission',
      error: error.message
    });
  }
};
