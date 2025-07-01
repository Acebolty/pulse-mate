const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addHealthData, getHealthData, getPatientHealthData } = require('../controllers/healthDataController');

// @route   POST api/health-data
// @desc    Add new health data for the logged-in user
// @access  Private
router.post('/', authMiddleware, addHealthData);

// @route   GET api/health-data
// @desc    Get health data for the logged-in user, with optional filters
// @access  Private
router.get('/', authMiddleware, getHealthData);

// @route   GET api/health-data/patient/:patientId
// @desc    Get health data for a specific patient (for doctors)
// @access  Private (Doctor only)
router.get('/patient/:patientId', authMiddleware, getPatientHealthData);

module.exports = router;
