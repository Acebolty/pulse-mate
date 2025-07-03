const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  // In a real app, you might want to prevent the app from starting or throw a more specific error.
  // For now, this will cause JWT operations to fail if not set.
  // Consider process.exit(1) in server.js if critical env vars are missing.
}

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      address, // Expects an object
      emergencyContact, // Expects an object
      // Doctor-specific fields
      userType,
      specialization,
      licenseNumber
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide first name, last name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Build user data based on user type
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      dateOfBirth,
      gender,
      address, // Mongoose will use subschema defaults if parts are missing
      emergencyContact, // Mongoose will use subschema defaults if parts are missing
      // Settings will be initialized by the pre-save hook in User.js
    };

    // Add doctor-specific fields if this is a doctor registration
    if (userType === 'doctor') {
      console.log('👨‍⚕️ Creating doctor account with specialty:', specialization);
      userData.role = 'doctor';
      userData.doctorInfo = {
        specialty: specialization,
        licenseNumber: licenseNumber,
        approvalStatus: 'pending' // Doctors need admin approval
      };
    }

    const newUser = new User(userData);

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully!',
      userId: newUser._id 
    });

  } catch (error) {
    console.error('Signup Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' }); // Generic message
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { // Send back some user info for the frontend
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        });
      }
    );

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  signupUser,
  loginUser,
};
