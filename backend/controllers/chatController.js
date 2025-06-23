const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Initiate a chat with another user (find or create)
// @route   POST api/chats/initiate
// @access  Private
const initiateChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required.' });
  }
  if (receiverId === senderId) {
    return res.status(400).json({ message: 'Cannot create a chat with yourself.' });
  }

  try {
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ message: 'Receiver user not found.' });
    }

    const chat = await Chat.findOrCreateChat(senderId, receiverId);
    await chat.populate('participants', 'firstName lastName email profilePicture');
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error initiating chat:', error);
    res.status(500).json({ message: 'Server error while initiating chat.' });
  }
};

// @desc    Get all chat threads for the logged-in user
// @route   GET api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'firstName lastName email profilePicture')
      .populate({
        path: 'lastMessage',
        select: 'messageContent timestamp senderId status',
        populate: { path: 'senderId', select: 'firstName lastName' }
      })
      .sort({ lastMessageTimestamp: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error while fetching chats.' });
  }
};

// @desc    Get all messages for a specific chat
// @route   GET api/chats/:chatId/messages
// @access  Private
const getMessagesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const chat = await Chat.findOne({ _id: chatId, participants: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or user not authorized.' });
    }

    const options = {
        sort: { timestamp: -1 }, 
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        populate: { path: 'senderId', select: 'firstName lastName email profilePicture' }
    };

    const messages = await Message.find({ chatId }, null, options);
    const totalMessages = await Message.countDocuments({ chatId });
    
    res.json({
        data: messages.reverse(), 
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: parseInt(page),
        totalMessages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Chat not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
};

// @desc    Send a new message in a specific chat
// @route   POST api/chats/:chatId/messages
// @access  Private
const sendMessageInChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageContent } = req.body;
    const senderId = req.user.id;

    if (!messageContent) {
      return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: senderId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or user not authorized to send message.' });
    }

    const newMessage = new Message({
      chatId,
      senderId,
      messageContent,
    });

    await newMessage.save();

    chat.lastMessage = newMessage._id;
    chat.lastMessageTimestamp = newMessage.timestamp;
    await chat.save();
    
    await newMessage.populate('senderId', 'firstName lastName email profilePicture');
    res.status(201).json(newMessage);

  } catch (error) {
    console.error('Error sending message:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Chat not found (invalid ID format).' });
    }
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

module.exports = {
  initiateChat,
  getChats,
  getMessagesForChat,
  sendMessageInChat,
};
