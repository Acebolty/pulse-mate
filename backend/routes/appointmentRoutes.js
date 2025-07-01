const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment,
    getDoctorAppointments,
    getActiveSessions,
    getAvailableDoctors
} = require('../controllers/appointmentController');

// @route   POST api/appointments
// @desc    Create a new appointment for the logged-in user
// @access  Private
router.post('/', authMiddleware, createAppointment);

// @route   GET api/appointments
// @desc    Get appointments for the logged-in user
// @access  Private
router.get('/', authMiddleware, getAppointments);

// @route   GET api/appointments/doctor
// @desc    Get appointments where the logged-in user is the doctor/provider
// @access  Private
router.get('/doctor', authMiddleware, getDoctorAppointments);

// @route   GET api/appointments/active-sessions
// @desc    Get active appointment sessions for the logged-in user
// @access  Private
router.get('/active-sessions', authMiddleware, getActiveSessions);

// @route   GET api/appointments/available-doctors
// @desc    Get available doctors for appointment booking
// @access  Private
router.get('/available-doctors', authMiddleware, getAvailableDoctors);

// @route   PUT api/appointments/:appointmentId
// @desc    Update an appointment (e.g., status, notes, reschedule)
// @access  Private
router.put('/:appointmentId', authMiddleware, updateAppointment);

// @route   DELETE api/appointments/:appointmentId
// @desc    Delete/cancel an appointment
// @access  Private
router.delete('/:appointmentId', authMiddleware, deleteAppointment);

module.exports = router;
