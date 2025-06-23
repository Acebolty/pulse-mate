const multer = require('multer');

// Configure multer for memory storage (to get a buffer)
const storage = multer.memoryStorage();

// File filter to accept only common image types
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, or WEBP images are allowed.'), false); // Reject file
  }
};

// Configure multer upload instance
// Limits can be adjusted as needed (e.g., file size)
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB limit for profile pictures
  },
  fileFilter: fileFilter
});

// Middleware to handle a single file upload with the field name 'profilePicture'
// The field name 'profilePicture' must match the name attribute of the file input in your frontend form.
const uploadProfilePicture = upload.single('profilePicture'); 

module.exports = {
  uploadProfilePicture,
  // You can add other multer configurations here if needed for different types of uploads
  // e.g., upload.array('photos', 5) for multiple files
};
