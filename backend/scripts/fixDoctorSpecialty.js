require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixDoctorSpecialty = async () => {
  try {
    await connectDB();

    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`📋 Found ${doctors.length} doctor(s)`);

    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Doctor: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`📧 Email: ${doctor.email}`);
      console.log(`🏥 Current doctorInfo:`, doctor.doctorInfo);

      // Check if specialty is missing or empty
      if (!doctor.doctorInfo?.specialty) {
        console.log('⚠️  Missing specialty, updating...');
        
        // Update the doctor with specialty
        await User.findByIdAndUpdate(doctor._id, {
          $set: {
            'doctorInfo.specialty': 'Cardiology',
            'doctorInfo.licenseNumber': doctor.doctorInfo?.licenseNumber || 'MD12345',
            'doctorInfo.approvalStatus': 'approved'
          }
        });
        
        console.log('✅ Updated doctor specialty to Cardiology');
      } else {
        console.log(`✅ Specialty already set: ${doctor.doctorInfo.specialty}`);
      }
    }

    // Verify the updates
    console.log('\n🔍 Verification:');
    const updatedDoctors = await User.find({ role: 'doctor' });
    for (const doctor of updatedDoctors) {
      console.log(`👨‍⚕️ ${doctor.firstName} ${doctor.lastName}: ${doctor.doctorInfo?.specialty || 'NO SPECIALTY'}`);
    }

    console.log('\n✅ Doctor specialty fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing doctor specialty:', error);
    process.exit(1);
  }
};

fixDoctorSpecialty();
