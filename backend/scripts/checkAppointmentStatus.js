require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');

const checkAppointmentStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Checking appointment and chat status...\n');

    // Check approved appointments
    const approvedAppts = await Appointment.find({ status: 'Approved' });
    console.log(`✅ Found ${approvedAppts.length} approved appointment(s)`);
    
    if (approvedAppts.length > 0) {
      const appt = approvedAppts[0];
      console.log('\n📋 Appointment Details:');
      console.log(`   - ID: ${appt._id}`);
      console.log(`   - Status: ${appt.status}`);
      console.log(`   - Reason: ${appt.reason}`);
      console.log(`   - Provider: ${appt.providerName}`);
      console.log(`   - Chat Room ID: ${appt.chatRoomId || 'None'}`);
      console.log(`   - Chat Enabled: ${appt.chatEnabled}`);
      
      // Check if chat room exists
      if (appt.chatRoomId) {
        const chatRoom = await Chat.findById(appt.chatRoomId);
        if (chatRoom) {
          console.log('\n💬 Chat Room Details:');
          console.log(`   - Chat ID: ${chatRoom._id}`);
          console.log(`   - Participants: ${chatRoom.participants.length}`);
          console.log(`   - Messages: ${chatRoom.messages.length}`);
          console.log(`   - Created: ${chatRoom.createdAt}`);
        } else {
          console.log('\n❌ Chat room not found in database');
        }
      } else {
        console.log('\n❌ No chat room linked to appointment');
      }
      
      // Get patient and doctor info
      const patient = await User.findById(appt.userId);
      const doctor = await User.findOne({ 
        role: 'doctor',
        $expr: { 
          $regexMatch: { 
            input: { $concat: ['$firstName', ' ', '$lastName'] }, 
            regex: appt.providerName, 
            options: 'i' 
          } 
        }
      });
      
      console.log('\n👥 Participants:');
      console.log(`   - Patient: ${patient?.firstName} ${patient?.lastName} (${patient?.email})`);
      console.log(`   - Doctor: ${doctor?.firstName} ${doctor?.lastName} (${doctor?.email})`);
      
      // Check if chat room should exist between these users
      if (patient && doctor) {
        const existingChat = await Chat.findOne({
          participants: { $all: [patient._id, doctor._id], $size: 2 }
        });
        
        if (existingChat) {
          console.log('\n✅ Chat room exists between patient and doctor');
          console.log(`   - Chat ID: ${existingChat._id}`);
        } else {
          console.log('\n❌ No chat room found between patient and doctor');
        }
      }
    }
    
    // Check all chats
    const allChats = await Chat.find({});
    console.log(`\n💬 Total chat rooms in database: ${allChats.length}`);
    
    if (allChats.length > 0) {
      console.log('\n📝 Chat Rooms:');
      for (const chat of allChats) {
        console.log(`   - ID: ${chat._id} | Participants: ${chat.participants.length} | Messages: ${chat.messages.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkAppointmentStatus();
