const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn(`Attempt to upload unsupported file type: ${file.mimetype}`);
    cb(new Error('Invalid file type'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 files
  }
});

const handleFileUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('File upload error:', err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

const handleMultipleFileUpload = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multiple file upload error:', err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        logger.error('Multiple file upload error:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

module.exports = {
  handleFileUpload,
  handleMultipleFileUpload
};