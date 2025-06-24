"use client"

import { useState, useRef, useEffect } from "react"
import api from '../services/api'; // Import API service
// Assuming getCurrentUser might be useful to identify the current user for message display
import { getCurrentUser } from '../services/authService'; 
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

// Dummy chat data
const chatList = [
  {
    id: 1,
    providerId: "dr-sarah-wilson",
    providerName: "Dr. Sarah Wilson",
    specialty: "Internal Medicine",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    lastMessage: "Your blood test results look good. Let's schedule a follow-up.",
    lastMessageTime: "2024-01-20T15:30:00Z",
    unreadCount: 2,
    isOnline: true,
    lastSeen: "Active now",
    isUrgent: false,
  },
  {
    id: 2,
    providerId: "dr-michael-chen",
    providerName: "Dr. Michael Chen",
    specialty: "Cardiology",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    lastMessage: "Please monitor your blood pressure and update me daily.",
    lastMessageTime: "2024-01-20T10:15:00Z",
    unreadCount: 0,
    isOnline: false,
    lastSeen: "2 hours ago",
    isUrgent: true,
  },
  {
    id: 3,
    providerId: "dr-emily-rodriguez",
    providerName: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    avatar:
      "https://images.unsplash.com/photo-1594824475317-d0b8e8b5e8b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    lastMessage: "Great job on maintaining your glucose levels!",
    lastMessageTime: "2024-01-19T16:45:00Z",
    unreadCount: 0,
    isOnline: true,
    lastSeen: "Active now",
    isUrgent: false,
  },
  {
    id: 4,
    providerId: "dr-amanda-foster",
    providerName: "Dr. Amanda Foster",
    specialty: "Psychology",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    lastMessage: "How are you feeling today? Remember to practice the breathing exercises.",
    lastMessageTime: "2024-01-19T14:20:00Z",
    unreadCount: 1,
    isOnline: false,
    lastSeen: "1 day ago",
    isUrgent: false,
  },
  {
    id: 5,
    providerId: "nurse-jennifer",
    providerName: "Nurse Jennifer",
    specialty: "Care Coordinator",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    lastMessage: "Reminder: Your appointment with Dr. Wilson is tomorrow at 10 AM.",
    lastMessageTime: "2024-01-18T09:00:00Z",
    unreadCount: 0,
    isOnline: true,
    lastSeen: "Active now",
    isUrgent: false,
  },
]

const messages = {
  "dr-sarah-wilson": [
    {
      id: 1,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message: "Hello John! I've reviewed your recent blood work results.",
      timestamp: "2024-01-20T14:00:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 2,
      senderId: "patient",
      senderName: "John Doe",
      message: "Hi Dr. Wilson! How do they look?",
      timestamp: "2024-01-20T14:05:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 3,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message:
        "Overall, they look very good! Your cholesterol levels have improved significantly since our last check.",
      timestamp: "2024-01-20T14:10:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 4,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message: "Here's a detailed breakdown of your results:",
      timestamp: "2024-01-20T14:12:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 5,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message: "blood-test-results-jan-2024.pdf",
      timestamp: "2024-01-20T14:13:00Z",
      type: "file",
      fileName: "blood-test-results-jan-2024.pdf",
      fileSize: "245 KB",
      status: "read",
    },
    {
      id: 6,
      senderId: "patient",
      senderName: "John Doe",
      message: "That's great news! Thank you for sharing the results. Should I continue with my current medication?",
      timestamp: "2024-01-20T14:20:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 7,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message: "Yes, please continue with your current regimen. The improvements show it's working well.",
      timestamp: "2024-01-20T15:25:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 8,
      senderId: "dr-sarah-wilson",
      senderName: "Dr. Sarah Wilson",
      message: "Your blood test results look good. Let's schedule a follow-up.",
      timestamp: "2024-01-20T15:30:00Z",
      type: "text",
      status: "delivered",
    },
  ],
  "dr-michael-chen": [
    {
      id: 1,
      senderId: "dr-michael-chen",
      senderName: "Dr. Michael Chen",
      message: "Good morning John. I wanted to follow up on your recent EKG results.",
      timestamp: "2024-01-20T09:00:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 2,
      senderId: "patient",
      senderName: "John Doe",
      message: "Good morning Dr. Chen. Is everything okay?",
      timestamp: "2024-01-20T09:30:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 3,
      senderId: "dr-michael-chen",
      senderName: "Dr. Michael Chen",
      message:
        "The results show some minor irregularities, but nothing concerning. However, I'd like you to monitor your blood pressure more closely.",
      timestamp: "2024-01-20T10:00:00Z",
      type: "text",
      status: "read",
    },
    {
      id: 4,
      senderId: "dr-michael-chen",
      senderName: "Dr. Michael Chen",
      message: "Please monitor your blood pressure and update me daily.",
      timestamp: "2024-01-20T10:15:00Z",
      type: "text",
      status: "read",
    },
  ],
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const Messages = () => {
  const [chatList, setChatList] = useState([]); // To store fetched chat threads
  const [selectedChat, setSelectedChat] = useState(null); // No chat selected initially
  const [currentMessages, setCurrentMessages] = useState([]); // Messages for the selected chat
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChatInfo, setShowChatInfo] = useState(false); // For the right sidebar
  const [isTyping, setIsTyping] = useState(false); // Placeholder for typing indicator
  const [showChatList, setShowChatList] = useState(true); // Show chat list by default on mobile if no chat selected

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null); // General error for the page

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = getCurrentUser(); // Get logged-in user info

  // Fetch Chat List
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      setError(null);
      try {
        const response = await api.get('/chats');
        // Transform backend chat data to match frontend structure if needed
        const transformedChats = response.data.map(chat => {
          // Assuming chat.participants has at least two users, and one is not current user
          const otherParticipant = chat.participants.find(p => p._id !== currentUser?.id);
          return {
            // Frontend dummy data structure: id, providerId, providerName, specialty, avatar, lastMessage, lastMessageTime, unreadCount, isOnline, lastSeen, isUrgent
            // Backend chat structure: _id, participants, lastMessage (object), lastMessageTimestamp
            id: chat._id, // Use chat._id as the unique id
            providerId: otherParticipant?._id, // Use other participant's ID
            providerName: otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown User",
            specialty: otherParticipant?.specialty || "User", // Backend User model doesn't have specialty by default
            avatar: otherParticipant?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'U')}&background=random`, // Placeholder avatar
            lastMessage: chat.lastMessage?.messageContent || "No messages yet...",
            lastMessageTime: chat.lastMessageTimestamp || chat.updatedAt,
            unreadCount: chat.unreadCounts?.find(uc => uc.userId === currentUser?.id)?.count || 0, // Assuming unreadCounts structure
            isOnline: otherParticipant?.isOnline || false, // Backend User model doesn't have isOnline
            lastSeen: otherParticipant?.lastSeen || "N/A", // Backend User model doesn't have lastSeen
            isUrgent: false, // This logic would need to be determined (e.g., based on keywords, sender role)
            // Store the full chat object from backend if needed for more details
            _rawChat: chat 
          };
        });
        setChatList(transformedChats);
        if (transformedChats.length > 0 && !selectedChat) {
          // Optionally select the first chat by default on desktop
          // setSelectedChat(transformedChats[0]); // This would trigger fetching its messages
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        setError("Could not load your conversations.");
      } finally {
        setLoadingChats(false);
      }
    };
    if(currentUser?.id) fetchChats();
  }, [currentUser?.id]); // Re-fetch if user changes (though unlikely in this component's lifecycle)

  // Fetch Messages for Selected Chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?._rawChat?._id) { // Use _rawChat._id which is the actual chat ID
        setCurrentMessages([]);
        return;
      }
      setLoadingMessages(true);
      setError(null);
      try {
        // TODO: Implement pagination for messages if needed
        const response = await api.get(`/chats/${selectedChat._rawChat._id}/messages`);
        // Transform messages if needed to match frontend structure
        // Frontend structure: id, senderId, senderName, message, timestamp, type, status, fileName, fileSize
        // Backend Message structure: _id, chatId, senderId (object), messageContent, timestamp, status
        const transformedMessages = response.data.data.map(msg => ({
          id: msg._id,
          senderId: msg.senderId?._id, // Assuming senderId is populated
          senderName: msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : "Unknown",
          message: msg.messageContent,
          timestamp: msg.timestamp,
          type: "text", // Assuming all are text for now; extend if file uploads are added
          status: msg.status || "sent", // Ensure status exists
        }));
        setCurrentMessages(transformedMessages);
      } catch (err) {
        console.error(`Failed to fetch messages for chat ${selectedChat._rawChat._id}:`, err);
        setError("Could not load messages for this conversation.");
      } finally {
        setLoadingMessages(false);
      }
    };

    if (selectedChat) {
      fetchMessages();
    } else {
      setCurrentMessages([]); // Clear messages if no chat is selected
    }
  }, [selectedChat]);


  const filteredChats = chatList.filter(
    (chat) =>
      chat.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.specialty && chat.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]); // Scrolls when new messages are added or selected chat changes

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat?._rawChat?._id) return;

    const tempMessageId = `temp-${Date.now()}`; // For optimistic update
    const newMessageOptimistic = {
      id: tempMessageId,
      senderId: currentUser?.id, // Current user is the sender
      senderName: "You", // Or fetch current user's name
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sending", // Optimistic status
    };

    // Optimistic UI update
    setCurrentMessages(prevMessages => [...prevMessages, newMessageOptimistic]);
    const messageToSend = messageInput.trim();
    setMessageInput(""); // Clear input immediately

    try {
      const response = await api.post(`/chats/${selectedChat._rawChat._id}/messages`, {
        messageContent: messageToSend,
      });
      const savedMessage = response.data;
      
      // Update the message list with the actual message from server
      setCurrentMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessageId ? {
            id: savedMessage._id,
            senderId: savedMessage.senderId?._id,
            senderName: savedMessage.senderId ? `${savedMessage.senderId.firstName} ${savedMessage.senderId.lastName}` : "You",
            message: savedMessage.messageContent,
            timestamp: savedMessage.timestamp,
            type: "text", // Assuming text
            status: savedMessage.status || "sent",
          } : msg
        )
      );
      
      // Update the last message in the chatList for the selected chat
      setChatList(prevChatList => prevChatList.map(chat => 
        chat.id === selectedChat.id 
        ? { ...chat, lastMessage: savedMessage.messageContent, lastMessageTime: savedMessage.timestamp }
        : chat
      ));

    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
      // Revert optimistic update or mark message as failed
      setCurrentMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessageId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const getMessageStatus = (status) => {
    switch (status) {
      case "sent":
        return <ClockIcon className="w-3 h-3 text-gray-400 dark:text-slate-500" />
      case "delivered":
        return <CheckIcon className="w-3 h-3 text-gray-400 dark:text-slate-500" />
      case "read":
        return (
          <div className="flex">
            <CheckIcon className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            <CheckIcon className="w-3 h-3 text-blue-500 dark:text-blue-400 -ml-1" />
          </div>
        )
      default:
        return null
    }
  }

  const totalUnreadCount = chatList.reduce((sum, chat) => sum + chat.unreadCount, 0)

  return (
    <div className="h-full flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Chat List Sidebar */}
      {/* Show on medium screens and up, or when showChatList is true on smaller screens */}
      <div
        className={`
          ${showChatList || selectedChat === null ? 'block' : 'hidden'} md:block 
          w-full md:w-1/3 border-r border-gray-200 dark:border-slate-700 flex flex-col 
          bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm 
          absolute md:relative inset-0 z-10 md:z-0 
          transition-transform duration-300 ease-in-out
          ${selectedChat === null || showChatList ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          pt-16 md:pt-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {/* Button to hide chat list on mobile when a chat is selected */}
              {selectedChat && (
                <button
                  onClick={() => setShowChatList(false)}
                  className="md:hidden p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Messages</h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">{totalUnreadCount}</span>
              )}
              <button className="p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <EllipsisVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-1 sm:focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-slate-400">
              <ChatBubbleLeftRightIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 text-gray-300 dark:text-slate-600" />
              <p className="text-xs sm:text-sm">No conversations found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat)
                  setShowChatList(false) // Hide chat list on mobile after selecting a chat
                }}
                className={`p-3 sm:p-4 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-green-50 dark:hover:bg-green-700/20 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-green-50 dark:bg-green-700/20 border-r-2 sm:border-r-4 border-r-green-500 dark:border-r-green-600" : ""
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar || "/placeholder.svg"}
                      alt={chat.providerName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border border-white dark:border-slate-800 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.providerName}</h3>
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        {chat.isUrgent && <ExclamationTriangleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />}
                        <span className="text-2xs sm:text-xs text-gray-500 dark:text-slate-400">{formatTime(chat.lastMessageTime)}</span>
                      </div>
                    </div>

                    <p className="text-2xs sm:text-xs text-gray-600 dark:text-slate-300 mb-0.5 sm:mb-1">{chat.specialty}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 truncate flex-1">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-1.5 sm:ml-2 bg-green-500 text-white text-2xs sm:text-xs rounded-full px-1.5 py-0.5 min-w-[18px] sm:min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-2xs sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5 sm:mt-1">{chat.lastSeen}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {/* Show when a chat is selected, or hide on small screens if chat list is shown */}
      <div
        className={`
          flex-1 flex-col bg-gray-50 dark:bg-slate-900
          ${selectedChat ? (showChatList ? 'hidden md:flex' : 'flex') : 'hidden md:flex'}
        `}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Button to show chat list on mobile */}
                  <button
                    onClick={() => setShowChatList(true)}
                    className="md:hidden p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedChat.avatar || "/placeholder.svg"}
                      alt={selectedChat.providerName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">{selectedChat.providerName}</h2>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">{selectedChat.specialty}</p>
                      {selectedChat.isUrgent && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400 text-2xs sm:text-xs rounded-full">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{selectedChat.lastSeen}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <VideoCameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className="p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-slate-900">
              {currentMessages.map((message, index) => {
                const isPatient = message.senderId === "patient"
                const showAvatar =
                  index === 0 ||
                  currentMessages[index - 1].senderId !== message.senderId ||
                  new Date(message.timestamp) - new Date(currentMessages[index - 1].timestamp) > 300000 // 5 minutes

                return (
                  <div key={message.id} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-1.5 sm:space-x-2 max-w-[80%] sm:max-w-xs lg:max-w-md ${isPatient ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!isPatient && showAvatar && (
                        <img
                          src={selectedChat.avatar || "/placeholder.svg"}
                          alt={selectedChat.providerName}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      )}
                      {!isPatient && !showAvatar && <div className="w-6 sm:w-8"></div>}

                      <div className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}>
                        {showAvatar && (
                          <span className="text-2xs sm:text-xs text-gray-500 dark:text-slate-400 mb-0.5 sm:mb-1 px-1.5 sm:px-2">
                            {isPatient ? "You" : message.senderName} • {formatMessageTime(message.timestamp)}
                          </span>
                        )}

                        <div
                          className={`rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 max-w-full break-words ${
                            isPatient
                              ? "bg-green-500 text-white dark:bg-green-600" // Patient's messages
                              : message.type === "file"
                                ? "bg-blue-50 dark:bg-blue-700/20 border border-blue-200 dark:border-blue-600/40" // File messages from provider
                                : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600" // Text messages from provider
                          }`}
                        >
                          {message.type === "text" ? (
                            <p className={`text-xs sm:text-sm ${isPatient ? 'text-white' : 'text-gray-800 dark:text-slate-200'}`}>{message.message}</p>
                          ) : message.type === "file" ? (
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-600/30 rounded-md sm:rounded-lg">
                                <DocumentIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-slate-100">{message.fileName}</p>
                                <p className="text-2xs sm:text-xs text-gray-500 dark:text-slate-400">{message.fileSize}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {isPatient && (
                          <div className="flex items-center space-x-0.5 sm:space-x-1 mt-0.5 sm:mt-1 px-1.5 sm:px-2">
                            {getMessageStatus(message.status)}
                            <span className="text-2xs sm:text-xs text-gray-400 dark:text-slate-500">{formatMessageTime(message.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-1.5 sm:space-x-2 max-w-[80%] sm:max-w-xs lg:max-w-md">
                    <img
                      src={selectedChat.avatar || "/placeholder.svg"}
                      alt={selectedChat.providerName}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                    <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2">
                      <div className="flex space-x-0.5 sm:space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-end space-x-1.5 sm:space-x-3">
                <button
                  onClick={handleFileUpload}
                  className="p-1.5 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <PaperClipIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-xl sm:rounded-2xl resize-none text-xs sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-1 sm:focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    style={{ minHeight: "38px", maxHeight: "100px" }} // Adjusted height for mobile
                  />
                </div>

                <button className="p-1.5 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <FaceSmileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    messageInput.trim()
                      ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      : "bg-gray-200 text-gray-400 dark:bg-slate-600 dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  // Handle file upload
                  console.log("File selected:", e.target.files[0])
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-slate-600 mx-auto mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 mb-1 sm:mb-2">Select a conversation</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Choose a healthcare provider to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Sidebar */}
      {showChatInfo && selectedChat && (
        <div className="hidden md:block w-80 border-l border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-6 overflow-y-auto rounded-tr-2xl rounded-br-2xl shadow-lg">
          {/* On mobile, this could be a modal or a separate screen */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Chat Info</h3>
            <button onClick={() => setShowChatInfo(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <img
              src={selectedChat.avatar || "/placeholder.svg"}
              alt={selectedChat.providerName}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{selectedChat.providerName}</h4>
            <p className="text-gray-600 dark:text-slate-300">{selectedChat.specialty}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{selectedChat.lastSeen}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-300">Schedule Call</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <VideoCameraIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-300">Video Consultation</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <DocumentIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-300">Share Documents</span>
                </button>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Shared Files</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg">
                  <DocumentIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">blood-test-results-jan-2024.pdf</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">245 KB • 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Settings</h5>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-slate-300">Notifications</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-slate-300">Read Receipts</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-slate-700 dark:checked:bg-green-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
