const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // lastMessage stores the most recent message object itself, or just its ID
  // Storing ID and then populating might be more normalized if messages are very large.
  // For simplicity and to easily show a snippet, embedding a snippet or just timestamp might be enough.
  // Let's store last message ID and a timestamp for sorting chats.
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now,
    index: true // To sort chat threads by recent activity
  },
  // You could also add unread counts per participant if needed:
  // unreadCounts: [{ userId: Schema.Types.ObjectId, count: Number }]
}, { timestamps: true }); // createdAt, updatedAt for the chat thread itself

// Ensure unique combination of participants to prevent duplicate chat rooms
// Note: Order of participants matters for this index. 
// A more robust solution might involve sorting participant IDs before saving/querying.
// For a 2-person chat, this is simpler. For group chats, more complex logic is needed.
// For now, assuming 2-person chats primarily.
chatSchema.index({ participants: 1 }, { unique: false }); // Changed to false, as order matters. Logic to find existing chat will handle this.


// Method to find or create a chat between two users
chatSchema.statics.findOrCreateChat = async function(userId1, userId2) {
  // Ensure consistent order of participants to find existing chats regardless of who initiated
  const participants = [userId1, userId2].sort();
  
  let chat = await this.findOne({ 
    participants: { $all: participants, $size: participants.length } 
  });

  if (!chat) {
    chat = await this.create({ participants });
  }
  return chat;
};


const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
