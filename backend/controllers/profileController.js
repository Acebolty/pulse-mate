const User = require('../models/User'); // Path to your User model

// @desc    Get current logged-in user's profile
// @route   GET api/profile/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // req.user.id is populated by authMiddleware
    const userProfile = await User.findById(req.user.id).select('-passwordHash'); // Exclude passwordHash

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update current logged-in user's profile
// @route   PUT api/profile/me
// @access  Private
const updateUserProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    emergencyContact,
    profilePicture,
    timezone,
    language,
    settings,
    medicalInfo,
    healthTargets, // Added healthTargets here
    doctorInfo, // Added doctorInfo for doctor profile updates
    title // Added title for doctor profiles
  } = req.body;

  // Build fields to update
  const updateFields = {};
  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;
  if (email !== undefined) updateFields.email = email;
  if (phone !== undefined) updateFields.phone = phone;
  if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
  if (gender !== undefined) updateFields.gender = gender;
  if (title !== undefined) updateFields['doctorInfo.title'] = title;
  // Special handling for profilePicture to allow removal
  if (profilePicture !== undefined) { // If profilePicture is part of the request
    if (profilePicture === null || profilePicture === "") {
      // If client wants to remove picture
      const user = await User.findById(req.user.id);
      if (user && user.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicturePublicId);
          console.log(`Successfully deleted avatar from Cloudinary via profile update: ${user.profilePicturePublicId}`);
          updateFields.profilePicturePublicId = null; // Clear publicId too
        } catch (cloudinaryError) {
          console.error('Cloudinary avatar deletion error during profile update:', cloudinaryError);
          // Don't fail the whole profile update, but log it. DB will be updated to null.
        }
      }
      updateFields.profilePicture = null; // Set to null in DB
    } else {
      // This case should ideally not happen if uploads go through /me/avatar
      // But if a URL is directly provided, just save it (less secure, not recommended for new uploads)
      updateFields.profilePicture = profilePicture; 
    }
  }
  if (timezone !== undefined) updateFields.timezone = timezone;
  if (language !== undefined) updateFields.language = language;

  // Handle nested address object
  if (address && typeof address === 'object') {
    for (const key in address) {
      if (address.hasOwnProperty(key)) {
        updateFields[`address.${key}`] = address[key];
      }
    }
  } else if (address !== undefined) { // Allows unsetting the whole address object or specific fields
    updateFields.address = address;
  }


  // Handle nested emergencyContact object
  if (emergencyContact && typeof emergencyContact === 'object') {
    for (const key in emergencyContact) {
      if (emergencyContact.hasOwnProperty(key)) {
        updateFields[`emergencyContact.${key}`] = emergencyContact[key];
      }
    }
  } else if (emergencyContact !== undefined) {
     updateFields.emergencyContact = emergencyContact;
  }

  // Handle nested medicalInfo object
  if (medicalInfo && typeof medicalInfo === 'object') {
    // Direct fields
    if (medicalInfo.bloodType !== undefined) updateFields['medicalInfo.bloodType'] = medicalInfo.bloodType;
    if (medicalInfo.height !== undefined) updateFields['medicalInfo.height'] = medicalInfo.height;
    if (medicalInfo.weight !== undefined) updateFields['medicalInfo.weight'] = medicalInfo.weight;
    
    // Array fields - replace the whole array if provided
    if (medicalInfo.allergies !== undefined) updateFields['medicalInfo.allergies'] = medicalInfo.allergies;
    if (medicalInfo.chronicConditions !== undefined) updateFields['medicalInfo.chronicConditions'] = medicalInfo.chronicConditions;
    if (medicalInfo.medications !== undefined) updateFields['medicalInfo.medications'] = medicalInfo.medications;

    // Nested primaryDoctor object
    if (medicalInfo.primaryDoctor && typeof medicalInfo.primaryDoctor === 'object') {
      for (const key in medicalInfo.primaryDoctor) {
        if (medicalInfo.primaryDoctor.hasOwnProperty(key) && medicalInfo.primaryDoctor[key] !== undefined) {
          updateFields[`medicalInfo.primaryDoctor.${key}`] = medicalInfo.primaryDoctor[key];
        }
      }
    } else if (medicalInfo.primaryDoctor !== undefined) { // Allows setting primaryDoctor to null or empty object
        updateFields['medicalInfo.primaryDoctor'] = medicalInfo.primaryDoctor;
    }
  } else if (medicalInfo !== undefined) { // Allows setting the whole medicalInfo to null or empty object
      updateFields.medicalInfo = medicalInfo;
  }

  // Handle nested settings object
  if (settings && typeof settings === 'object') {
    for (const section in settings) {
      if (settings.hasOwnProperty(section) && settings[section] !== null && typeof settings[section] === 'object') {
        for (const key in settings[section]) {
          if (settings[section].hasOwnProperty(key) && settings[section][key] !== undefined ) { // ensure value is not undefined
            updateFields[`settings.${section}.${key}`] = settings[section][key];
          }
        }
      }
    }
  }

  // Handle nested doctorInfo object for doctor profiles
  if (doctorInfo && typeof doctorInfo === 'object') {
    console.log('📋 Processing doctorInfo update:', doctorInfo);

    // Direct fields
    if (doctorInfo.specialization !== undefined) updateFields['doctorInfo.specialization'] = doctorInfo.specialization;
    if (doctorInfo.subSpecialty !== undefined) updateFields['doctorInfo.subSpecialty'] = doctorInfo.subSpecialty;
    if (doctorInfo.yearsOfExperience !== undefined) updateFields['doctorInfo.yearsOfExperience'] = doctorInfo.yearsOfExperience;
    if (doctorInfo.biography !== undefined) updateFields['doctorInfo.biography'] = doctorInfo.biography;
    if (doctorInfo.phone !== undefined) updateFields['doctorInfo.phone'] = doctorInfo.phone;
    if (doctorInfo.officeAddress !== undefined) updateFields['doctorInfo.officeAddress'] = doctorInfo.officeAddress;
    if (doctorInfo.generalHours !== undefined) updateFields['doctorInfo.generalHours'] = doctorInfo.generalHours;
    if (doctorInfo.isAcceptingPatients !== undefined) updateFields['doctorInfo.isAcceptingPatients'] = doctorInfo.isAcceptingPatients;
    if (doctorInfo.consultationFee !== undefined) updateFields['doctorInfo.consultationFee'] = doctorInfo.consultationFee;

    // Array fields - replace the whole array if provided
    if (doctorInfo.qualifications !== undefined) updateFields['doctorInfo.qualifications'] = doctorInfo.qualifications;
    if (doctorInfo.languagesSpoken !== undefined) updateFields['doctorInfo.languagesSpoken'] = doctorInfo.languagesSpoken;
    if (doctorInfo.affiliatedHospitals !== undefined) updateFields['doctorInfo.affiliatedHospitals'] = doctorInfo.affiliatedHospitals;
  }

  // Handle nested healthTargets object
  if (healthTargets && typeof healthTargets === 'object') {
    for (const metric in healthTargets) {
      if (healthTargets.hasOwnProperty(metric) && healthTargets[metric] !== null && typeof healthTargets[metric] === 'object') {
        for (const key in healthTargets[metric]) {
          if (healthTargets[metric].hasOwnProperty(key) && healthTargets[metric][key] !== undefined) {
            updateFields[`healthTargets.${metric}.${key}`] = healthTargets[metric][key];
          }
        }
      }
    }
  }
  
  try {
    console.log('📋 Profile update - User ID:', req.user.id);
    console.log('📋 Profile update - Update fields:', JSON.stringify(updateFields, null, 2));

    const updatedUserProfile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' } // context: 'query' for runValidators with $set
    ).select('-passwordHash');

    console.log('✅ Profile updated successfully:', updatedUserProfile?.firstName, updatedUserProfile?.lastName);

    if (!updatedUserProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(updatedUserProfile);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).send('Server Error');
  }
};

const cloudinary = require('../config/cloudinaryConfig'); // Import configured Cloudinary instance
const DatauriParser = require('datauri/parser'); // To format buffer for Cloudinary
const path = require('path');

// Helper to convert buffer to data URI for Cloudinary
const parser = new DatauriParser();
const bufferToDataURI = (fileFormat, buffer) => parser.format(fileFormat, buffer).content;


// @desc    Upload or update user profile avatar
// @route   POST api/profile/me/avatar
// @access  Private
const uploadProfileAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      // This case should ideally be caught by authMiddleware or not happen if token is valid
      return res.status(404).json({ message: 'User not found.' });
    }

    // If user already has a profile picture with a public_id, delete it from Cloudinary
    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
        console.log(`Successfully deleted old avatar from Cloudinary: ${user.profilePicturePublicId}`);
      } catch (cloudinaryError) {
        // Log the error but don't necessarily fail the whole upload if deletion fails
        // The new image will overwrite the reference in the DB anyway.
        console.error('Cloudinary old avatar deletion error:', cloudinaryError);
      }
    }

    // Convert buffer to Data URI
    const fileFormat = path.extname(req.file.originalname).toString().substring(1);
    const dataUri = bufferToDataURI(fileFormat, req.file.buffer);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'patient_health_dashboard/avatars', // Optional: organize in a folder
      // public_id: `avatar_${req.user.id}`, // Optional: custom public_id, ensure uniqueness
      // transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }] // Optional: transform
    });

    // Update user's profilePicture URL (and public_id if you store it)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profilePicture: result.secure_url,
        profilePicturePublicId: result.public_id // Save the public_id
      },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      // Should not happen if authMiddleware passed and user exists
      return res.status(404).json({ message: 'User not found after update attempt.' });
    }

    res.json({ 
      message: 'Profile picture uploaded successfully.',
      profilePicture: updatedUser.profilePicture,
      // user: updatedUser // Or send the whole updated user object
    });

  } catch (error) {
    console.error('Error uploading profile avatar:', error);
    // Handle multer errors specifically if needed (e.g., file too large)
    if (error.message.includes('Only JPEG, PNG, GIF, or WEBP images are allowed')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max 5MB allowed.'});
    }
    res.status(500).json({ message: 'Server error during avatar upload.' });
  }
};


// @desc    Get patient profile for doctors
// @route   GET api/profile/patient/:patientId
// @access  Private (Doctor only)
const getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Verify the doctor has access to this patient (through appointments)
    const Appointment = require('../models/Appointment');
    const hasAccess = await Appointment.findOne({
      userId: patientId,
      providerId: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied. No appointment relationship with this patient.' });
    }

    // Get patient profile
    const patientProfile = await User.findById(patientId).select('-passwordHash');

    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patientProfile);
  } catch (err) {
    console.error('Error fetching patient profile:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
  getPatientProfile
};
