const Content = require('../models/content.model');
const { testConnection, localAuth } = require('../config/db');

// Get all website content sections
exports.getAllContent = async (req, res) => {
  try {
    // Check database connection
    const dbConnected = await testConnection();
    let contents;

    if (dbConnected) {
      contents = await Content.findAll();
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      contents = await localAuth.getAllContent();
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(200).json({
      success: true,
      data: contents
    });
  } catch (error) {
    console.error('Error fetching website content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch website content',
      error: error.message
    });
  }
};

// Get content by section identifier (e.g., 'about_us', 'home_banner')
exports.getContentBySection = async (req, res) => {
  try {
    const { section } = req.params;

    // Check database connection
    const dbConnected = await testConnection();
    let content;

    if (dbConnected) {
      content = await Content.findBySection(section);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      content = await localAuth.getContentBySection(section);
    } else {
      throw new Error('Database connection failed');
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `Content section '${section}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content section:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch content section',
      error: error.message
    });
  }
};

// Get content by ID
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check database connection
    const dbConnected = await testConnection();
    let content;

    if (dbConnected) {
      content = await Content.findById(id);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      content = await localAuth.getContentById(id);
    } else {
      throw new Error('Database connection failed');
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

// Update content (admin only)
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, metadata } = req.body;

    // Check database connection
    const dbConnected = await testConnection();
    let existingContent;
    let updatedContent;

    if (dbConnected) {
      // Check if content exists
      existingContent = await Content.findById(id);
      if (!existingContent) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Update the content
      updatedContent = await Content.update(id, {
        title: title || existingContent.title,
        content: content || existingContent.content,
        metadata: metadata || existingContent.metadata
      });
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      existingContent = await localAuth.getContentById(id);
      if (!existingContent) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      updatedContent = await localAuth.updateContent(id, {
        title: title || existingContent.title,
        content: content || existingContent.content,
        metadata: metadata || existingContent.metadata
      });
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
};

// Create new content section (admin only)
exports.createContent = async (req, res) => {
  try {
    const { section, title, content, metadata } = req.body;

    // Validate required fields
    if (!section || !title) {
      return res.status(400).json({
        success: false,
        message: 'Section and title are required fields'
      });
    }

    // Check database connection
    const dbConnected = await testConnection();
    let existingSection;
    let newContent;

    if (dbConnected) {
      // Check if section already exists
      existingSection = await Content.findBySection(section);
      if (existingSection) {
        return res.status(400).json({
          success: false,
          message: `Content section '${section}' already exists`
        });
      }

      // Create new content
      newContent = await Content.create({
        section,
        title,
        content: content || '',
        metadata: metadata || {}
      });
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      existingSection = await localAuth.getContentBySection(section);
      if (existingSection) {
        return res.status(400).json({
          success: false,
          message: `Content section '${section}' already exists`
        });
      }

      newContent = await localAuth.createContent({
        section,
        title,
        content: content || '',
        metadata: metadata || {}
      });
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: newContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
};

// Delete content (admin only)
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check database connection
    const dbConnected = await testConnection();
    let existingContent;

    if (dbConnected) {
      // Check if content exists
      existingContent = await Content.findById(id);
      if (!existingContent) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Delete the content
      await Content.delete(id);
    } else if (process.env.NODE_ENV === 'development') {
      // Fallback to local data in development mode
      console.log('Using local content data');
      existingContent = await localAuth.getContentById(id);
      if (!existingContent) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      await localAuth.deleteContent(id);
    } else {
      throw new Error('Database connection failed');
    }

    return res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};
