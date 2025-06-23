const express = require('express');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/authController'); // Import controller functions

// POST /api/auth/signup - User Registration
router.post('/signup', signupUser);

// POST /api/auth/login - User Login
router.post('/login', loginUser);

module.exports = router;
