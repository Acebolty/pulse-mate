"use client"

import { useState, useRef, useEffect } from "react"
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
  const [selectedChat, setSelectedChat] = useState(chatList[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const currentMessages = messages[selectedChat?.providerId] || []

  const filteredChats = chatList.filter(
    (chat) =>
      chat.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

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
        return <ClockIcon className="w-3 h-3 text-gray-400" />
      case "delivered":
        return <CheckIcon className="w-3 h-3 text-gray-400" />
      case "read":
        return (
          <div className="flex">
            <CheckIcon className="w-3 h-3 text-blue-500" />
            <CheckIcon className="w-3 h-3 text-blue-500 -ml-1" />
          </div>
        )
      default:
        return null
    }
  }

  const totalUnreadCount = chatList.reduce((sum, chat) => sum + chat.unreadCount, 0)

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              {totalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{totalUnreadCount}</span>
              )}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-green-50 border-r-2 border-r-green-500" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar || "/placeholder.svg"}
                      alt={chat.providerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{chat.providerName}</h3>
                      <div className="flex items-center space-x-1">
                        {chat.isUrgent && <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />}
                        <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-1">{chat.specialty}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">{chat.lastSeen}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedChat.avatar || "/placeholder.svg"}
                      alt={selectedChat.providerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedChat.providerName}</h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">{selectedChat.specialty}</p>
                      {selectedChat.isUrgent && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{selectedChat.lastSeen}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <InformationCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentMessages.map((message, index) => {
                const isPatient = message.senderId === "patient"
                const showAvatar =
                  index === 0 ||
                  currentMessages[index - 1].senderId !== message.senderId ||
                  new Date(message.timestamp) - new Date(currentMessages[index - 1].timestamp) > 300000 // 5 minutes

                return (
                  <div key={message.id} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isPatient ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!isPatient && showAvatar && (
                        <img
                          src={selectedChat.avatar || "/placeholder.svg"}
                          alt={selectedChat.providerName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {!isPatient && !showAvatar && <div className="w-8"></div>}

                      <div className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}>
                        {showAvatar && (
                          <span className="text-xs text-gray-500 mb-1 px-2">
                            {isPatient ? "You" : message.senderName} • {formatMessageTime(message.timestamp)}
                          </span>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2 max-w-full break-words ${
                            isPatient
                              ? "bg-green-500 text-white"
                              : message.type === "file"
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-white border border-gray-200"
                          }`}
                        >
                          {message.type === "text" ? (
                            <p className="text-sm">{message.message}</p>
                          ) : message.type === "file" ? (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <DocumentIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{message.fileName}</p>
                                <p className="text-xs text-gray-500">{message.fileSize}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {isPatient && (
                          <div className="flex items-center space-x-1 mt-1 px-2">
                            {getMessageStatus(message.status)}
                            <span className="text-xs text-gray-400">{formatMessageTime(message.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                    <img
                      src={selectedChat.avatar || "/placeholder.svg"}
                      alt={selectedChat.providerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-3">
                <button
                  onClick={handleFileUpload}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>

                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaceSmileIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    messageInput.trim()
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a healthcare provider to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Sidebar */}
      {showChatInfo && selectedChat && (
        <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Chat Info</h3>
            <button onClick={() => setShowChatInfo(false)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <img
              src={selectedChat.avatar || "/placeholder.svg"}
              alt={selectedChat.providerName}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h4 className="text-lg font-semibold text-gray-900">{selectedChat.providerName}</h4>
            <p className="text-gray-600">{selectedChat.specialty}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedChat.lastSeen}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Quick Actions</h5>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Schedule Call</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <VideoCameraIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Video Consultation</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <DocumentIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Share Documents</span>
                </button>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Shared Files</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <DocumentIcon className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">blood-test-results-jan-2024.pdf</p>
                    <p className="text-xs text-gray-500">245 KB • 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Settings</h5>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notifications</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Read Receipts</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
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
