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

const fixPdfUrls = async () => {
  try {
    await connectDB();

    console.log('🔧 Starting to fix PDF URLs from /image/upload/ to /raw/upload/...\n');

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

        // Check if it's a PDF with /image/upload/ URL
        if (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf') && 
            doc.fileUrl && doc.fileUrl.includes('/image/upload/')) {
          
          console.log(`  ⚠️  Found PDF with /image/upload/ URL`);
          
          // Convert /image/upload/ to /raw/upload/ for PDFs
          const fixedUrl = doc.fileUrl.replace('/image/upload/', '/raw/upload/');
          console.log(`  ✅ Fixed URL: ${fixedUrl}`);
          
          // Update the document
          updatedDocuments.push({
            ...doc.toObject(),
            fileUrl: fixedUrl
          });
          
          doctorFixed = true;
          totalFixed++;
        } else {
          // No fix needed, keep as is
          updatedDocuments.push(doc.toObject());
          console.log(`  ✅ No fix needed (not a PDF or already correct URL)`);
        }
      }

      // Update the doctor if any documents were fixed
      if (doctorFixed) {
        await User.findByIdAndUpdate(doctor._id, {
          $set: {
            'doctorInfo.applicationDocuments': updatedDocuments
          }
        });
        console.log(`  ✅ Updated PDF URLs for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      } else {
        console.log(`  ✅ No PDF URL fixes needed for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      }
    }

    console.log(`🎉 Fix completed! Total PDF URLs fixed: ${totalFixed}`);
    
    // Verify the fixes
    console.log('\n🔍 Verification - checking all doctor documents:');
    const verifyDoctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    for (const doctor of verifyDoctors) {
      console.log(`\n👨‍⚕️ Dr. ${doctor.firstName} ${doctor.lastName}:`);
      for (const doc of doctor.doctorInfo.applicationDocuments) {
        const urlType = doc.fileUrl.includes('/raw/upload/') ? 'RAW' : 
                       doc.fileUrl.includes('/image/upload/') ? 'IMAGE' : 'OTHER';
        console.log(`  📄 ${doc.documentType}: ${urlType} - ${doc.fileUrl}`);
      }
    }

    console.log('\n✅ PDF URL fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing PDF URLs:', error);
    process.exit(1);
  }
};

fixPdfUrls();
