const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const removePdfDocuments = async () => {
  try {
    await connectDB();

    console.log('🗑️  Removing PDF documents to allow re-upload as images...\n');

    // Find all doctors with application documents
    const doctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    console.log(`📋 Found ${doctors.length} doctors with documents to check\n`);

    let totalRemoved = 0;

    for (const doctor of doctors) {
      console.log(`👨‍⚕️ Checking Dr. ${doctor.firstName} ${doctor.lastName}...`);
      
      let doctorUpdated = false;
      const updatedDocuments = [];

      for (const doc of doctor.doctorInfo.applicationDocuments) {
        console.log(`  📄 Document: ${doc.documentType} - ${doc.fileName}`);

        // Check if it's a PDF document
        if (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf')) {
          console.log(`  ❌ Removing PDF document: ${doc.fileName}`);
          totalRemoved++;
          doctorUpdated = true;
          // Don't add to updatedDocuments (effectively removing it)
        } else {
          // Keep non-PDF documents
          updatedDocuments.push(doc.toObject());
          console.log(`  ✅ Keeping non-PDF document: ${doc.fileName}`);
        }
      }

      // Update the doctor if any documents were removed
      if (doctorUpdated) {
        await User.findByIdAndUpdate(doctor._id, {
          $set: {
            'doctorInfo.applicationDocuments': updatedDocuments
          }
        });
        console.log(`  ✅ Updated documents for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      } else {
        console.log(`  ✅ No PDF documents to remove for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      }
    }

    console.log(`🎉 Cleanup completed! Total PDF documents removed: ${totalRemoved}`);
    
    // Verify the cleanup
    console.log('\n🔍 Verification - checking remaining documents:');
    const verifyDoctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    for (const doctor of verifyDoctors) {
      console.log(`\n👨‍⚕️ Dr. ${doctor.firstName} ${doctor.lastName}:`);
      if (doctor.doctorInfo.applicationDocuments.length === 0) {
        console.log(`  📄 No documents remaining`);
      } else {
        for (const doc of doctor.doctorInfo.applicationDocuments) {
          const fileType = doc.fileName?.split('.').pop()?.toLowerCase() || 'unknown';
          console.log(`  📄 ${doc.documentType}: ${doc.fileName} (${fileType})`);
        }
      }
    }

    console.log('\n✅ PDF document removal completed successfully!');
    console.log('📝 Note: Users can now re-upload their documents as JPG/PNG images.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing PDF documents:', error);
    process.exit(1);
  }
};

removePdfDocuments();
