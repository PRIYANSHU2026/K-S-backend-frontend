const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage for product images
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || 'public/uploads', 'products');
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure storage for user avatar images
const userAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || 'public/uploads', 'avatars');
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create upload middleware instances
const uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // default 5MB
  }
});

const uploadUserAvatar = multer({
  storage: userAvatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // default 5MB
  }
});

// Error handler middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred during upload
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is ' +
          (parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)).toFixed(1) + 'MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }

  // No error
  next();
};

module.exports = {
  uploadProductImage,
  uploadUserAvatar,
  handleUploadError
};
