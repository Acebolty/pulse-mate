const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');

// @route   GET api/profile/me
// @desc    Get current logged-in user's profile
// @access  Private
router.get('/me', authMiddleware, getUserProfile);

// @route   PUT api/profile/me
// @desc    Update current logged-in user's profile
// @access  Private
router.put('/me', authMiddleware, updateUserProfile);

// Import multer middleware for avatar upload
const { uploadProfilePicture } = require('../middleware/multerUpload');
// Import the new controller function we will create
const { uploadProfileAvatar } = require('../controllers/profileController');

// @route   POST api/profile/me/avatar
// @desc    Upload or update user profile avatar
// @access  Private
router.post('/me/avatar', authMiddleware, uploadProfilePicture, uploadProfileAvatar);


module.exports = router;
