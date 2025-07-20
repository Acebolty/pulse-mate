// Load environment variables from .env file
require('dotenv').config(); 

// Import necessary modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
// Import Cloudinary config (this will also execute the config code)
require('./config/cloudinaryConfig'); 


// Initialize the Express application
const app = express();

// Middleware setup
// Enable CORS for all routes - allows your frontend to communicate with this backend
app.use(cors());

// Parse incoming JSON requests - allows us to read req.body
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Define a port for the server to listen on
const PORT = process.env.PORT || 5001;

// MongoDB Atlas Connection String
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1); // Exit if the DB connection string is missing
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
    // Optionally, you might want to exit the process if DB connection fails
    // process.exit(1); 
  });



// Basic route to test if the server is running
app.get('/', (req, res) => {
  res.send('Remote Health Monitoring Backend Server is running!');
});

// Public route to get basic platform statistics for landing page
app.get('/api/public/stats', async (req, res) => {
  try {
    const User = require('./models/User');

    // Get counts for patients and doctors
    const totalPatients = await User.countDocuments({
      $or: [
        { role: { $exists: false } }, // Users without role (default patients)
        { role: 'patient' }
      ]
    });

    const totalDoctors = await User.countDocuments({
      role: 'doctor',
      'doctorInfo.approvalStatus': 'approved' // Only count approved doctors
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        uptime: '99.9%', // Static value for now
        support: '24/7' // Static value
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
});

// Import and use auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // All routes in authRoutes will be prefixed with /api/auth

// Import and use profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes); // All routes in profileRoutes will be prefixed with /api/profile

// Import and use health data routes
const healthDataRoutes = require('./routes/healthDataRoutes');
app.use('/api/health-data', healthDataRoutes); // All routes will be prefixed with /api/health-data

// Import and use alert routes
const alertRoutes = require('./routes/alertRoutes');
app.use('/api/alerts', alertRoutes); // All routes will be prefixed with /api/alerts

// Import and use appointment routes
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes); // All routes will be prefixed with /api/appointments

// Import and use chat routes
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes); // All routes will be prefixed with /api/chats

// Import and use simulation routes
const simulationRoutes = require('./routes/simulation');
app.use('/api/simulation', simulationRoutes); // All routes will be prefixed with /api/simulation

// Import and use email test routes (for development/testing)
const emailTestRoutes = require('./routes/emailTest');
app.use('/api/email-test', emailTestRoutes); // All routes will be prefixed with /api/email-test

// Import and use notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes); // All routes will be prefixed with /api/notifications

// Import and use admin routes
const adminRoutes = require('./routes/adminRoutes');
console.log('📋 Admin routes loaded successfully');
app.use('/api/admin', adminRoutes); // All routes will be prefixed with /api/admin
console.log('📋 Admin routes registered at /api/admin');

// Note: app.listen() is now inside the mongoose.connect().then() block
