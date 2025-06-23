const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat', // Reference to the Chat model
    required: true,
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (sender)
    required: true
  },
  // receiverId is implicit via the Chat's participants if it's a 2-person chat.
  // For group chats, you wouldn't have a single receiverId here.
  // For simplicity, we'll rely on chatId and senderId.
  // receiverId: { 
  //   type: Schema.Types.ObjectId,
  //   ref: 'User', // Reference to the User model (receiver)
  //   required: true 
  // },
  messageContent: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Status can be simplified for a school project. 
  // 'sent' is usually enough from backend. 'delivered'/'read' often need more complex client-side logic or web sockets.
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // For file attachments (future enhancement)
  // fileUrl: String,
  // fileName: String,
  // fileType: String, // e.g., 'image/jpeg', 'application/pdf'
}, { timestamps: true }); // createdAt, updatedAt for the message document

// Index for fetching messages in a chat, sorted by time
messageSchema.index({ chatId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
