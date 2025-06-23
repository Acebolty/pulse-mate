const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    initiateChat, 
    getChats, 
    getMessagesForChat, 
    sendMessageInChat 
} = require('../controllers/chatController');

// @route   POST api/chats/initiate
// @desc    Initiate a chat with another user (find or create)
// @access  Private
router.post('/initiate', authMiddleware, initiateChat);

// @route   GET api/chats
// @desc    Get all chat threads for the logged-in user
// @access  Private
router.get('/', authMiddleware, getChats);

// @route   GET api/chats/:chatId/messages
// @desc    Get all messages for a specific chat
// @access  Private
router.get('/:chatId/messages', authMiddleware, getMessagesForChat);

// @route   POST api/chats/:chatId/messages
// @desc    Send a new message in a specific chat
// @access  Private
router.post('/:chatId/messages', authMiddleware, sendMessageInChat);

module.exports = router;
