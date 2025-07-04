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
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
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

  const [isTyping, setIsTyping] = useState(false); // Placeholder for typing indicator
  const [showChatList, setShowChatList] = useState(true); // Show chat list by default on mobile if no chat selected

  // Appointment session states
  const [appointmentSessions, setAppointmentSessions] = useState([]); // Active appointment sessions
  const [sessionStatus, setSessionStatus] = useState({}); // Status of each session (doctor-controlled)

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null); // General error for the page
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = getCurrentUser(); // Get logged-in user info

  // Fetch Chat List Function
  const fetchChats = async (silent = false) => {
      if (!silent) {
        setLoadingChats(true);
        setError(null);
      }
      try {
        const response = await api.get('/chats');
        // Transform backend chat data to match frontend structure if needed
        // Transform chats and fetch doctor details for each
        const transformedChats = await Promise.all(response.data.map(async (chat) => {
          // Assuming chat.participants has at least two users, and one is not current user
          const otherParticipant = chat.participants.find(p => p._id !== currentUser?.id);

          // Doctor details are now included in the backend response
          console.log('Participant data:', {
            otherParticipant,
            role: otherParticipant?.role,
            doctorInfo: otherParticipant?.doctorInfo
          });

          return {
            // Frontend dummy data structure: id, providerId, providerName, specialty, avatar, lastMessage, lastMessageTime, unreadCount, isOnline, lastSeen, isUrgent
            // Backend chat structure: _id, participants, lastMessage (object), lastMessageTimestamp
            id: chat._id, // Use chat._id as the unique id
            providerId: otherParticipant?._id, // Use other participant's ID
            providerName: otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown User",
            specialty: (() => {
              // Use doctor info directly from backend response

              let specialty;
              if (otherParticipant?.doctorInfo?.specialty) {
                specialty = otherParticipant.doctorInfo.specialty;
              } else if (otherParticipant?.role === 'doctor') {
                specialty = 'General Medicine'; // Default for doctors without specialty
              } else if (otherParticipant?.email?.includes('doctor')) {
                specialty = 'General Medicine'; // Fallback for doctor emails
              } else {
                specialty = 'General Medicine'; // Default for all chats in appointment system
              }
              return specialty;
            })(), // Show specialty for medical chats
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
        }));
        setChatList(transformedChats);
        if (transformedChats.length > 0 && !selectedChat) {
          // Optionally select the first chat by default on desktop
          // setSelectedChat(transformedChats[0]); // This would trigger fetching its messages
        }
      } catch (err) {
        if (!silent) {
          console.error("Failed to fetch chats:", err);
          setError("Could not load your conversations.");
        }
      } finally {
        if (!silent) {
          setLoadingChats(false);
        }
      }
    };

  // Initial fetch on mount
  useEffect(() => {
    if(currentUser?.id) {
      fetchChats();
      fetchAppointmentSessions();
    }
  }, [currentUser?.id]); // Re-fetch if user changes (though unlikely in this component's lifecycle)

  // Auto-refresh chat list for new messages (silent)
  useEffect(() => {
    if (!currentUser?.id) return;

    const interval = setInterval(() => {
      // Silent refresh - no loading states
      fetchChats(true);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Refresh sessions when window gains focus (to catch new approvals)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing appointment sessions...');
      fetchAppointmentSessions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Fetch active appointment sessions (now doctor-controlled)
  const fetchAppointmentSessions = async () => {
    try {
      const response = await api.get('/appointments/active-sessions');
      const sessions = response.data.data || [];
      setAppointmentSessions(sessions);

      console.log('📋 Active sessions found:', sessions.length);
      console.log('📋 Sessions:', sessions);

      // Initialize session status (no more timers - doctor controlled)
      const status = {};

      sessions.forEach(session => {
        if (session.status === 'Open Chat' && session.chatEnabled) {
          // Doctor-controlled session - active
          console.log(`✅ Active session found: ${session._id}`);
          console.log('Session data:', {
            id: session._id,
            status: session.status,
            chatEnabled: session.chatEnabled,
            sessionStartTime: session.sessionStartTime
          });

          status[session._id] = 'active';
        } else if (session.status === 'completed') {
          // Session ended by doctor
          console.log(`🔚 Completed session found: ${session._id}`);
          status[session._id] = 'ended';
        }
      });

      // No more timers - just status
      setSessionStatus(status);
    } catch (error) {
      console.error('Failed to fetch appointment sessions:', error);
    }
  };

  // Refresh sessions periodically to check for doctor status changes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Refreshing appointment sessions...');
      fetchAppointmentSessions();
    }, 30000); // Check every 30 seconds for status changes

    return () => clearInterval(interval);
  }, []);

  // Check if current chat is an appointment session (doctor-controlled)
  const getCurrentSessionInfo = () => {
    if (!selectedChat?._rawChat?._id) {
      console.log('🔍 No selected chat or chat ID');
      return null;
    }

    console.log('🔍 Looking for session with chatRoomId:', selectedChat._rawChat._id);
    console.log('🔍 Available sessions:', appointmentSessions);

    const session = appointmentSessions.find(s =>
      s.chatRoomId === selectedChat._rawChat._id
    );

    console.log('🔍 Found session:', session);

    if (session) {
      // Determine status based on appointment status
      let isActive = false;
      let displayStatus = 'inactive';

      console.log('🔍 Session status:', session.status, 'chatEnabled:', session.chatEnabled);

      if (session.status === 'Open Chat' && session.chatEnabled) {
        isActive = true;
        displayStatus = 'active';
        console.log('✅ Session is ACTIVE');
      } else if (session.status === 'Completed') {
        isActive = false;
        displayStatus = 'ended';
        console.log('❌ Session is ENDED');
      } else {
        console.log('⚠️ Session status not recognized:', session.status);
      }

      return {
        ...session,
        status: displayStatus,
        isActive: isActive
      };
    }

    console.log('❌ No session found for this chat');
    return null;
  };

  // Render message input area
  const renderMessageInput = () => {
    const sessionInfo = getCurrentSessionInfo();

    // Check if there's any appointment session (active or ended)
    if (!sessionInfo) {
      // No appointment exists - show booking message
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 mb-3">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Book an appointment to chat with Dr. {selectedChat?.providerName}</span>
          </div>
          <button
            onClick={() => {
              // Navigate to appointments page
              window.location.href = '/appointments';
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Book Appointment
          </button>
        </div>
      );
    }

    // Check if session has ended
    const isSessionEnded = sessionInfo && !sessionInfo.isActive;
    if (isSessionEnded) {
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Appointment session has ended. Chat is now read-only.</span>
          </div>
        </div>
      );
    }

    // Active appointment session - allow messaging
    return (
      <div className="flex items-end space-x-1.5 sm:space-x-3">
        <button
          onClick={handleFileUpload}
          className="p-1.5 sm:p-2 rounded-xl transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
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
            className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-xl sm:rounded-2xl translate-y-2 resize-none text-xs sm:text-sm focus:ring-1 sm:focus:ring-2 focus:border-transparent border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-green-500 dark:focus:ring-green-600"
            style={{ minHeight: "38px", maxHeight: "100px" }}
          />
        </div>

        <button
          className="p-1.5 sm:p-2 rounded-xl transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <FaceSmileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
            messageInput.trim()
              ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              : "bg-gray-200 text-gray-400 dark:bg-slate-600 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    );
  };

  // Fetch Messages for Selected Chat Function
  const fetchMessages = async (silent = false) => {
      if (!selectedChat?._rawChat?._id) { // Use _rawChat._id which is the actual chat ID
        setCurrentMessages([]);
        return;
      }
      if (!silent) {
        setLoadingMessages(true);
        setError(null);
      }
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
        if (!silent) {
          console.error(`Failed to fetch messages for chat ${selectedChat._rawChat._id}:`, err);
          setError("Could not load messages for this conversation.");
        }
      } finally {
        if (!silent) {
          setLoadingMessages(false);
        }
      }
    };

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      setIsInitialLoad(true); // Reset initial load flag for new chat
      fetchMessages();
      // Only scroll to bottom when switching chats on desktop
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      }
    } else {
      setCurrentMessages([]); // Clear messages if no chat is selected
    }
  }, [selectedChat]);

  // Auto-refresh messages for real-time sync (silent)
  useEffect(() => {
    if (!selectedChat?._rawChat?._id) return;

    const interval = setInterval(() => {
      // Silent refresh - no loading states
      fetchMessages(true);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedChat]);

  const filteredChats = chatList.filter(
    (chat) =>
      chat.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.specialty && chat.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Completely disable auto-scroll on mobile to preserve manual scroll control
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    if (messagesContainerRef.current && currentMessages.length > 0) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // Auto-scroll on desktop if:
      // 1. This is the initial load (first time viewing messages)
      // 2. User is near the bottom (to avoid interrupting reading)
      // 3. Short conversation (5 or fewer messages)
      if (isInitialLoad || isNearBottom || currentMessages.length <= 5) {
        setTimeout(() => {
          scrollToBottom();
          setIsInitialLoad(false); // Mark that initial load is complete
        }, 100);
      }
    }
  }, [currentMessages, isInitialLoad]); // Scrolls when new messages are added or selected chat changes

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
                  className="md:hidden p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Messages</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* Reactivate Session Button */}
              {(() => {
                const hasExpiredSession = chatList.some(chat => {
                  const sessionInfo = appointmentSessions.find(s => s.chatRoomId === chat._rawChat?._id);
                  return sessionInfo && sessionStatus[sessionInfo._id] !== 'active';
                });

                if (hasExpiredSession) {
                  return (
                    <button
                      onClick={async () => {
                        try {
                          console.log('🔄 Reactivating session...');
                          console.log('🔑 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
                          console.log('👤 Current user:', getCurrentUser());

                          // Call the reactivation endpoint
                          const response = await api.post('/appointments/reactivate-latest');
                          console.log('📋 Response:', response.data);

                          // Refresh the sessions
                          fetchAppointmentSessions();
                          console.log('✅ Session reactivated!');
                        } catch (error) {
                          console.error('❌ Error reactivating session:', error);
                          console.error('❌ Error details:', error.response?.data);
                        }
                      }}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center space-x-1"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Reactivate</span>
                    </button>
                  );
                }
                return null;
              })()}

              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">{totalUnreadCount}</span>
              )}
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
              className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-xl sm:rounded-xl text-xs sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-1 sm:focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
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
                className={`p-4 m-2 rounded-xl cursor-pointer transition-all duration-300 border ${
                  selectedChat?.id === chat.id
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700/50 shadow-lg transform scale-[1.02]"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600"
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">Dr. {chat.providerName}</h3>
                        {chat.isOnline && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 text-2xs rounded-full font-medium">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {chat.isUrgent && <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />}
                        <span className="text-xs text-gray-500 dark:text-slate-400">{formatTime(chat.lastMessageTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-400 text-xs rounded-full font-medium">
                        {chat.specialty || 'General Medicine'}
                      </span>
                      {(() => {
                        const sessionInfo = appointmentSessions.find(s => s.chatRoomId === chat._rawChat?._id);
                        if (sessionInfo && sessionStatus[sessionInfo._id] === 'active') {
                          return (
                            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 text-xs rounded-full font-medium flex items-center space-x-1.5">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Session Active</span>
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 truncate flex-1">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-1.5 sm:ml-2 bg-green-500 text-white text-2xs sm:text-xs rounded-full px-1.5 py-0.5 min-w-[18px] sm:min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center">
                      {(() => {
                        const sessionInfo = appointmentSessions.find(s => s.chatRoomId === chat._rawChat?._id);
                        if (sessionInfo && sessionStatus[sessionInfo._id] === 'active') {
                          return (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 text-xs rounded-full font-medium flex items-center space-x-1 w-fit">
                              <ChatBubbleLeftRightIcon className="w-3 h-3" />
                              <span>Active Session</span>
                            </span>
                          );
                        }
                        return (
                          <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                            Available for consultation
                          </span>
                        );
                      })()}
                    </div>
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
                    className="md:hidden p-1 sm:p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
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
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">Dr. {selectedChat.providerName}</h2>
                      {selectedChat.isOnline && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 text-2xs rounded-full font-medium">
                          Online
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-400 text-2xs rounded-xl font-medium">
                        {selectedChat.specialty || 'General Medicine'}
                      </span>
                      {selectedChat.isUrgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400 text-2xs rounded-full">Urgent</span>
                      )}
                      {/* Session Timer for Appointment Chats */}
                      {(() => {
                        const sessionInfo = getCurrentSessionInfo();
                        if (sessionInfo) {
                          return (
                            <div className={`px-3 py-2 rounded-xl font-medium flex items-center space-x-2 ${
                              sessionInfo.isActive
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-700/20 dark:to-emerald-700/20 dark:text-green-400 border border-green-200 dark:border-green-600/30'
                                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-700/20 dark:to-rose-700/20 dark:text-red-400 border border-red-200 dark:border-red-600/30'
                            }`}>
                              {sessionInfo.isActive ? (
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                              ) : (
                                <ClockIcon className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {sessionInfo.isActive
                                  ? 'Doctor is available - Session Active'
                                  : 'Waiting for doctor to open session'
                                }
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <p className="text-xs sm:text-xs text-gray-500 dark:text-slate-400 ml-2">
                      {(() => {
                        const sessionInfo = getCurrentSessionInfo();
                        if (sessionInfo) {
                          return sessionInfo.isActive ? 'Active' : 'Session Ended';
                        }
                        return 'Available';
                      })()}
                    </p>
                  </div>
                </div>


              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 max-h-96 min-h-96 scroll-smooth"
            >
              <div className="space-y-3 sm:space-y-4 pb-4">
              {currentMessages.map((message, index) => {
                const isPatient = message.senderId === currentUser?.id // Check if sender is current user (patient)
                const showAvatar =
                  index === 0 ||
                  currentMessages[index - 1].senderId !== message.senderId ||
                  new Date(message.timestamp) - new Date(currentMessages[index - 1].timestamp) > 300000 // 5 minutes

                return (
                  <div key={message.id} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-1.5 sm:space-x-2 max-w-[80%] sm:max-w-xs lg:max-w-md ${isPatient ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {/* Doctor Avatar (left side) */}
                      {!isPatient && showAvatar && (
                        <img
                          src={selectedChat.avatar || "/placeholder.svg"}
                          alt={selectedChat.providerName}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      )}
                      {!isPatient && !showAvatar && <div className="w-6 sm:w-8"></div>}

                      {/* Patient Avatar (right side) */}
                      {isPatient && showAvatar && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs sm:text-sm font-medium text-white flex-shrink-0">
                          {(currentUser?.firstName?.[0] || 'P') + (currentUser?.lastName?.[0] || '')}
                        </div>
                      )}
                      {isPatient && !showAvatar && <div className="w-6 sm:w-8"></div>}

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
                            <div className="flex items-center space-x-2 sm:space-x-3 ">
                              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-600/30 rounded-xl sm:rounded-xl">
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
            </div>

            {/* Message Input */}
            <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              {renderMessageInput()}

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


    </div>
  )
}

export default Messages
