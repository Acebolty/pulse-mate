const cloudinary = require('cloudinary').v2; // Use v2 for the latest SDK features

// Configure Cloudinary with credentials from environment variables
// Ensure you have CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
// set in your .env file
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Ensures HTTPS URLs are generated
  });
  console.log('Cloudinary configured successfully.');
} catch (error) {
  console.error('Cloudinary configuration error:', error);
  // Depending on your error handling strategy, you might want to exit or throw
}

module.exports = cloudinary;
