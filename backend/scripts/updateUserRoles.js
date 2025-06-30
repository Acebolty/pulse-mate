require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updateUserRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    let updatedCount = 0;

    for (const user of users) {
      let role = 'patient'; // Default role
      let doctorInfo = {};

      // Determine role based on email and existing data
      if (user.email === 'admin@pulsemate.com') {
        role = 'admin';
        console.log(`Setting ${user.email} as admin`);
      } else if (user.email === 'doctor@pulsemate.com' || user.patientId?.startsWith('DR-')) {
        role = 'doctor';
        // Set doctor-specific information
        doctorInfo = {
          licenseNumber: user.patientId || 'MD12345',
          specialty: 'Cardiology',
          experience: 10,
          department: 'Cardiology',
          approvalStatus: 'approved',
          approvedAt: new Date()
        };
        console.log(`Setting ${user.email} as doctor with specialty: ${doctorInfo.specialty}`);
      } else {
        role = 'patient';
        console.log(`Setting ${user.email} as patient`);
      }

      // Update the user
      const updateData = { role };
      if (role === 'doctor') {
        updateData.doctorInfo = doctorInfo;
      }

      await User.findByIdAndUpdate(user._id, updateData);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} users with roles:`);
    
    // Verify the updates
    const adminCount = await User.countDocuments({ role: 'admin' });
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const patientCount = await User.countDocuments({ role: 'patient' });

    console.log(`📊 Final counts:`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Doctors: ${doctorCount}`);
    console.log(`   - Patients: ${patientCount}`);
    console.log(`   - Total: ${adminCount + doctorCount + patientCount}`);

    // Show updated users
    console.log(`\n👥 Updated users:`);
    const updatedUsers = await User.find({}, 'firstName lastName email role doctorInfo.specialty').sort({ role: 1 });
    updatedUsers.forEach(user => {
      const specialty = user.doctorInfo?.specialty ? ` (${user.doctorInfo.specialty})` : '';
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}${specialty}`);
    });

  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the script
updateUserRoles();
