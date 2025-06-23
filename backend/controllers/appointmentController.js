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
  const { providerName, dateTime, reason, type, status, notes, virtualLink } = req.body;
  const { appointmentId } = req.params;

  try {
    let appointment = await Appointment.findOne({ _id: appointmentId, userId: req.user.id });

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

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
