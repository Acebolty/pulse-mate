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

const fixDoubleExtensions = async () => {
  try {
    await connectDB();

    console.log('🔧 Starting to fix double file extensions in doctor documents...\n');

    // Find all doctors with application documents
    const doctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    console.log(`📋 Found ${doctors.length} doctors with documents to check\n`);

    let totalFixed = 0;

    for (const doctor of doctors) {
      console.log(`👨‍⚕️ Checking Dr. ${doctor.firstName} ${doctor.lastName}...`);
      
      let doctorFixed = false;
      const updatedDocuments = [];

      for (const doc of doctor.doctorInfo.applicationDocuments) {
        console.log(`  📄 Document: ${doc.documentType} - ${doc.fileName}`);
        console.log(`  🔗 Current URL: ${doc.fileUrl}`);

        // Check if the URL has double extensions
        const urlParts = doc.fileUrl.split('.');
        if (urlParts.length >= 3) {
          const lastTwoParts = urlParts.slice(-2);
          
          // Check for common double extensions like .pdf.pdf, .jpg.jpg, etc.
          if (lastTwoParts[0] === lastTwoParts[1]) {
            console.log(`  ⚠️  Found double extension: .${lastTwoParts[0]}.${lastTwoParts[1]}`);
            
            // Remove the last extension to fix the double extension
            const fixedUrl = urlParts.slice(0, -1).join('.');
            console.log(`  ✅ Fixed URL: ${fixedUrl}`);
            
            // Update the document
            updatedDocuments.push({
              ...doc.toObject(),
              fileUrl: fixedUrl
            });
            
            doctorFixed = true;
            totalFixed++;
          } else {
            // No double extension, keep as is
            updatedDocuments.push(doc.toObject());
          }
        } else {
          // URL doesn't have enough parts to have double extension
          updatedDocuments.push(doc.toObject());
        }
      }

      // Update the doctor if any documents were fixed
      if (doctorFixed) {
        await User.findByIdAndUpdate(doctor._id, {
          $set: {
            'doctorInfo.applicationDocuments': updatedDocuments
          }
        });
        console.log(`  ✅ Updated documents for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      } else {
        console.log(`  ✅ No fixes needed for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      }
    }

    console.log(`🎉 Fix completed! Total documents fixed: ${totalFixed}`);
    
    // Verify the fixes
    console.log('\n🔍 Verification - checking all doctor documents:');
    const verifyDoctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    for (const doctor of verifyDoctors) {
      console.log(`\n👨‍⚕️ Dr. ${doctor.firstName} ${doctor.lastName}:`);
      for (const doc of doctor.doctorInfo.applicationDocuments) {
        console.log(`  📄 ${doc.documentType}: ${doc.fileUrl}`);
      }
    }

    console.log('\n✅ Double extension fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing double extensions:', error);
    process.exit(1);
  }
};

fixDoubleExtensions();
