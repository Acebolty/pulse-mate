require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');

const fixChatRoom = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔧 Fixing chat room structure...\n');

    // Get the approved appointment
    const appt = await Appointment.findOne({ status: 'Approved' });
    if (!appt) {
      console.log('❌ No approved appointment found');
      return;
    }

    console.log(`📋 Working with appointment: ${appt._id}`);
    console.log(`   - Chat Room ID: ${appt.chatRoomId}`);

    // Get the chat room
    const chatRoom = await Chat.findById(appt.chatRoomId);
    if (!chatRoom) {
      console.log('❌ Chat room not found');
      return;
    }

    console.log('\n💬 Current Chat Room:');
    console.log(`   - ID: ${chatRoom._id}`);
    console.log(`   - Participants: ${JSON.stringify(chatRoom.participants)}`);
    console.log(`   - Messages: ${chatRoom.messages || 'undefined'}`);
    console.log(`   - Created: ${chatRoom.createdAt}`);

    // Fix the chat room structure if needed
    let needsUpdate = false;
    const updates = {};

    // Ensure messages array exists
    if (!chatRoom.messages) {
      updates.messages = [];
      needsUpdate = true;
      console.log('🔧 Adding messages array');
    }

    // Enable chat for the appointment
    if (!appt.chatEnabled) {
      await Appointment.findByIdAndUpdate(appt._id, { chatEnabled: true });
      console.log('🔧 Enabled chat for appointment');
    }

    // Update chat room if needed
    if (needsUpdate) {
      await Chat.findByIdAndUpdate(chatRoom._id, updates);
      console.log('🔧 Updated chat room structure');
    }

    // Get participant details
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
    console.log(`   - Patient: ${patient?.firstName} ${patient?.lastName} (${patient?._id})`);
    console.log(`   - Doctor: ${doctor?.firstName} ${doctor?.lastName} (${doctor?._id})`);

    // Verify chat room participants
    const updatedChatRoom = await Chat.findById(appt.chatRoomId);
    console.log('\n✅ Updated Chat Room:');
    console.log(`   - Participants: ${updatedChatRoom.participants.length}`);
    console.log(`   - Messages: ${updatedChatRoom.messages?.length || 0}`);
    console.log(`   - Chat Enabled: ${appt.chatEnabled}`);

    console.log('\n🎉 Chat room is ready for use!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

fixChatRoom();
