const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { signupUser, loginUser, doctorSignup, logoutUser } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow documents and images
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, image, or Word document.'), false);
    }
  }
});

// POST /api/auth/signup - User Registration
router.post('/signup', signupUser);

// POST /api/auth/login - User Login
router.post('/login', loginUser);

// POST /api/auth/logout - User Logout
router.post('/logout', auth, logoutUser);

// POST /api/auth/doctor-signup - Doctor Registration with Documents
router.post('/doctor-signup', doctorSignup);

// POST /api/auth/upload-document - Document Upload for Registration
router.post('/upload-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    // File validation - Only images allowed for consistency and compatibility
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG and PNG image files are allowed. Please scan or convert your documents to image format.'
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    // Upload to Cloudinary
    // Remove file extension from original filename to prevent double extensions
    // (Cloudinary automatically adds the correct extension based on file type)
    const fileNameWithoutExt = req.file.originalname.replace(/\.[^/.]+$/, "");

    console.log(`📄 Uploading image: ${req.file.originalname}`);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image', // All documents are now images
          folder: `doctor-registration/${documentType}`,
          public_id: `${Date.now()}_${fileNameWithoutExt}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    console.log(`📄 Image upload successful: ${uploadResult.secure_url}`);

    res.json({
      message: 'Document uploaded successfully',
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      documentType
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

module.exports = router;
