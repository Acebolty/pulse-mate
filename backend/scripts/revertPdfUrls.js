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

const revertPdfUrls = async () => {
  try {
    await connectDB();

    console.log('🔧 Reverting PDF URLs back to /image/upload/ (since file was uploaded as image)...\n');

    // Find all doctors with application documents
    const doctors = await User.find({ 
      role: 'doctor',
      'doctorInfo.applicationDocuments': { $exists: true, $ne: [] }
    });

    console.log(`📋 Found ${doctors.length} doctors with documents to check\n`);

    let totalReverted = 0;

    for (const doctor of doctors) {
      console.log(`👨‍⚕️ Checking Dr. ${doctor.firstName} ${doctor.lastName}...`);
      
      let doctorFixed = false;
      const updatedDocuments = [];

      for (const doc of doctor.doctorInfo.applicationDocuments) {
        console.log(`  📄 Document: ${doc.documentType} - ${doc.fileName}`);
        console.log(`  🔗 Current URL: ${doc.fileUrl}`);

        // Check if it's a PDF with /raw/upload/ URL that needs to be reverted
        if (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf') && 
            doc.fileUrl && doc.fileUrl.includes('/raw/upload/')) {
          
          console.log(`  ⚠️  Found PDF with /raw/upload/ URL - reverting to /image/upload/`);
          
          // Convert /raw/upload/ back to /image/upload/ since the file was originally uploaded as image
          const revertedUrl = doc.fileUrl.replace('/raw/upload/', '/image/upload/');
          console.log(`  ✅ Reverted URL: ${revertedUrl}`);
          
          // Update the document
          updatedDocuments.push({
            ...doc.toObject(),
            fileUrl: revertedUrl
          });
          
          doctorFixed = true;
          totalReverted++;
        } else {
          // No revert needed, keep as is
          updatedDocuments.push(doc.toObject());
          console.log(`  ✅ No revert needed`);
        }
      }

      // Update the doctor if any documents were reverted
      if (doctorFixed) {
        await User.findByIdAndUpdate(doctor._id, {
          $set: {
            'doctorInfo.applicationDocuments': updatedDocuments
          }
        });
        console.log(`  ✅ Reverted PDF URLs for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      } else {
        console.log(`  ✅ No PDF URL reverts needed for Dr. ${doctor.firstName} ${doctor.lastName}\n`);
      }
    }

    console.log(`🎉 Revert completed! Total PDF URLs reverted: ${totalReverted}`);
    
    // Verify the reverts
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

    console.log('\n✅ PDF URL revert completed successfully!');
    console.log('📝 Note: The PDF was originally uploaded as an image type, so it needs to be re-uploaded properly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reverting PDF URLs:', error);
    process.exit(1);
  }
};

revertPdfUrls();
