const Appointment = require('../models/Appointment');

// @desc    Create a new appointment for the logged-in user
// @route   POST api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { providerName, dateTime, reason, type, notes, virtualLink } = req.body;

    if (!providerName || !dateTime || !reason) {
      return res.status(400).json({ message: 'Please provide provider name, date/time, and reason for the appointment.' });
    }

    const appointmentDate = new Date(dateTime);
    if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date/time format for appointment.' });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      providerName,
      dateTime: appointmentDate,
      reason,
      type: type || 'Consultation',
      notes,
      virtualLink,
      status: 'Scheduled'
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);

  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating appointment.' });
  }
};

// @desc    Get appointments for the logged-in user
// @route   GET api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, upcoming, past, limit = 10, page = 1, sortBy = 'dateTime', order = 'asc' } = req.query;
    const query = { userId: req.user.id };

    if (status) query.status = status;

    const now = new Date();
    if (upcoming === 'true') query.dateTime = { $gte: now };
    else if (past === 'true') query.dateTime = { $lt: now };
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    if (sortBy === 'dateTime') sortOptions.dateTime = sortOrder;
    else sortOptions.createdAt = sortOrder;

    const options = {
      sort: sortOptions,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const appointments = await Appointment.find(query, null, options);
    const totalAppointments = await Appointment.countDocuments(query);

    res.json({
      data: appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      totalAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments.' });
  }
};

// @desc    Update an appointment
// @route   PUT api/appointments/:appointmentId
// @access  Private
const updateAppointment = async (req, res) => {
  const {
    providerName,
    dateTime,
    reason,
    type,
    status,
    notes,
    virtualLink,
    // Additional fields for doctor status management
    completionSummary,
    followUpNeeded,
    followUpDate,
    recommendations,
    completedAt,
    cancellationReason,
    notifyPatient,
    refundRequested,
    cancelledAt,
    rescheduleReason
  } = req.body;
  const { appointmentId } = req.params;

  try {
    // Check if user is the patient (original logic) or the doctor/provider
    let appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [
        { userId: req.user.id }, // User is the patient
        { providerId: req.user.id } // User is the doctor/provider
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or user not authorized.' });
    }

    if (providerName) appointment.providerName = providerName;
    if (dateTime) {
        const newDateTime = new Date(dateTime);
        if (isNaN(newDateTime.getTime())) return res.status(400).json({ message: 'Invalid date/time format.' });
        appointment.dateTime = newDateTime;
    }
    if (reason) appointment.reason = reason;
    if (type) appointment.type = type;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (virtualLink !== undefined) appointment.virtualLink = virtualLink;

    // Handle additional doctor status management fields
    if (completionSummary !== undefined) appointment.completionSummary = completionSummary;
    if (followUpNeeded !== undefined) appointment.followUpNeeded = followUpNeeded;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);
    if (recommendations !== undefined) appointment.recommendations = recommendations;
    if (completedAt) appointment.completedAt = new Date(completedAt);
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;
    if (notifyPatient !== undefined) appointment.notifyPatient = notifyPatient;
    if (refundRequested !== undefined) appointment.refundRequested = refundRequested;
    if (cancelledAt) appointment.cancelledAt = new Date(cancelledAt);
    if (rescheduleReason !== undefined) appointment.rescheduleReason = rescheduleReason;

    await appointment.save();
    res.json(appointment);

  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Appointment not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while updating appointment.' });
  }
};

// @desc    Delete/cancel an appointment
// @route   DELETE api/appointments/:appointmentId
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ 
        _id: req.params.appointmentId, 
        userId: req.user.id 
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or user not authorized.' });
    }
    res.json({ message: 'Appointment deleted successfully.' });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    if (error.kind === 'ObjectId') { // Changed err to error
        return res.status(404).json({ message: 'Appointment not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while deleting appointment.' });
  }
};

// @desc    Get appointments for a doctor (where doctor is the provider)
// @route   GET api/appointments/doctor
// @access  Private
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, upcoming, past, limit = 10, page = 1, sortBy = 'dateTime', order = 'asc' } = req.query;

    console.log('🩺 getDoctorAppointments called for user:', req.user.id);

    // Get the current doctor's info
    const User = require('../models/User');
    const doctor = await User.findById(req.user.id);
    if (!doctor) {
      console.log('❌ Doctor not found for ID:', req.user.id);
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('✅ Doctor found:', doctor.firstName, doctor.lastName);

    // Build the query to find appointments where this doctor is the provider
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    const query = {
      $or: [
        { providerName: { $regex: doctorName, $options: 'i' } },
        { providerId: req.user.id },
        { providerId: req.user.id.toString() }
      ]
    };

    if (status) query.status = status;

    const now = new Date();
    if (upcoming === 'true') query.dateTime = { $gte: now };
    else if (past === 'true') query.dateTime = { $lt: now };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    if (sortBy === 'dateTime') sortOptions.dateTime = sortOrder;
    else sortOptions.createdAt = sortOrder;

    const options = {
      sort: sortOptions,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    console.log('🔍 Query for doctor appointments:', JSON.stringify(query, null, 2));

    // Populate patient information
    const appointments = await Appointment.find(query, null, options).populate('userId', 'firstName lastName email dateOfBirth gender profilePicture');
    const totalAppointments = await Appointment.countDocuments(query);

    console.log('📅 Found appointments:', appointments.length);
    console.log('📋 Appointment details:', appointments.map(apt => ({
      id: apt._id,
      patient: apt.userId ? `${apt.userId.firstName} ${apt.userId.lastName}` : 'Unknown',
      date: apt.dateTime,
      status: apt.status,
      providerName: apt.providerName,
      providerId: apt.providerId
    })));

    res.json({
      data: appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      totalAppointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server error while fetching doctor appointments.' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
};
