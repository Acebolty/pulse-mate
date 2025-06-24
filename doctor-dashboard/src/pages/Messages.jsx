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
  UserCircleIcon, // For patient info
  ArrowLeftIcon, // For mobile back button
  BriefcaseIcon, // For doctor's role or quick actions
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"


// Dummy chat data for Doctor's View
const patientChatList = [
  {
    id: 1,
    patientId: "patient-alice-wonderland",
    patientName: "Alice Wonderland",
    patientAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Thank you, Doctor! I'll monitor my BP as advised.",
    lastMessageTime: "2024-01-22T15:30:00Z",
    unreadCount: 0, // Unread from patient's perspective for the doctor
    isOnline: true,
    lastSeen: "Active now",
    isUrgent: false,
    condition: "Hypertension", // Example additional info
  },
  {
    id: 2,
    patientId: "patient-robert-smith",
    patientName: "Robert Smith",
    patientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "I've uploaded my latest ECG readings for your review.",
    lastMessageTime: "2024-01-22T10:15:00Z",
    unreadCount: 1,
    isOnline: false,
    lastSeen: "2 hours ago",
    isUrgent: true, // Example: if patient marked as needing urgent attention
    condition: "Arrhythmia",
  },
  {
    id: 3,
    patientId: "patient-maria-garcia",
    patientName: "Maria Garcia",
    patientAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Feeling much better with the new medication, thanks!",
    lastMessageTime: "2024-01-21T16:45:00Z",
    unreadCount: 0,
    isOnline: true,
    lastSeen: "Active now",
    isUrgent: false,
    condition: "Diabetes Type 2",
  },
   {
    id: 4,
    patientId: "patient-john-doe",
    patientName: "John Doe",
    patientAvatar: "https://randomuser.me/api/portraits/men/75.jpg",
    lastMessage: "Can I get a refill for my anxiety medication?",
    lastMessageTime: "2024-01-22T09:30:00Z",
    unreadCount: 3,
    isOnline: false,
    lastSeen: "Online 5h ago",
    isUrgent: false,
    condition: "Anxiety Disorder",
  },
]

const doctorMessages = {
  "patient-alice-wonderland": [
    { id: 1, senderId: "doctor-current", senderName: "Dr. Eve", message: "Hi Alice, please ensure you're taking your BP readings twice a day.", timestamp: "2024-01-22T14:00:00Z", type: "text", status: "read" },
    { id: 2, senderId: "patient-alice-wonderland", senderName: "Alice Wonderland", message: "Will do, Dr. Eve. Morning readings are usually around 135/85.", timestamp: "2024-01-22T14:05:00Z", type: "text", status: "read" },
    { id: 3, senderId: "doctor-current", senderName: "Dr. Eve", message: "Okay, that's a bit high for the morning. Let's keep an eye on it. Any dizziness or headaches?", timestamp: "2024-01-22T14:10:00Z", type: "text", status: "read"},
    { id: 4, senderId: "patient-alice-wonderland", senderName: "Alice Wonderland", message: "Thank you, Doctor! I'll monitor my BP as advised.", timestamp: "2024-01-22T15:30:00Z", type: "text", status: "read" },
  ],
  "patient-robert-smith": [
    { id: 1, senderId: "patient-robert-smith", senderName: "Robert Smith", message: "Dr. Eve, I'm having some palpitations again. Should I be concerned?", timestamp: "2024-01-22T09:00:00Z", type: "text", status: "read" },
    { id: 2, senderId: "doctor-current", senderName: "Dr. Eve", message: "Hi Robert. Please describe the palpitations. How long do they last? Any other symptoms?", timestamp: "2024-01-22T09:05:00Z", type: "text", status: "read" },
    { id: 3, senderId: "patient-robert-smith", senderName: "Robert Smith", message: "They are like flutters, last a few seconds. Sometimes I feel a bit lightheaded.", timestamp: "2024-01-22T09:10:00Z", type: "text", status: "read" },
    { id: 4, senderId: "patient-robert-smith", senderName: "Robert Smith", message: "I've uploaded my latest ECG readings for your review.", timestamp: "2024-01-22T10:15:00Z", type: "file", fileName: "ECG_Robert_Smith_Jan22.pdf", fileSize: "450 KB", status: "delivered" },
  ],
   "patient-maria-garcia": [
    { id: 1, senderId: "patient-maria-garcia", senderName: "Maria Garcia", message: "Hi Dr. Eve, just wanted to update you. My glucose levels have been much more stable this week!", timestamp: "2024-01-21T16:40:00Z", type: "text", status: "read" },
    { id: 2, senderId: "doctor-current", senderName: "Dr. Eve", message: "That's excellent news, Maria! Keep up the great work with your diet and medication.", timestamp: "2024-01-21T16:42:00Z", type: "text", status: "read" },
    { id: 3, senderId: "patient-maria-garcia", senderName: "Maria Garcia", message: "Feeling much better with the new medication, thanks!", timestamp: "2024-01-21T16:45:00Z", type: "text", status: "read" },
  ],
  "patient-john-doe": [
    { id: 1, senderId: "patient-john-doe", senderName: "John Doe", message: "Good morning Dr. Eve, I hope you're well.", timestamp: "2024-01-22T09:25:00Z", type: "text", status: "delivered" },
    { id: 2, senderId: "patient-john-doe", senderName: "John Doe", message: "I'm running low on my anxiety medication.", timestamp: "2024-01-22T09:28:00Z", type: "text", status: "delivered" },
    { id: 3, senderId: "patient-john-doe", senderName: "John Doe", message: "Can I get a refill for my anxiety medication?", timestamp: "2024-01-22T09:30:00Z", type: "text", status: "delivered" },
  ]
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) { return `${diffInHours}h ago`; }
  else if (diffInDays === 1) { return "Yesterday"; }
  else if (diffInDays < 7) { return `${diffInDays}d ago`; }
  else { return date.toLocaleDateString(); }
};

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const Messages = () => {
  const [selectedPatientChat, setSelectedPatientChat] = useState(patientChatList[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientInfo, setShowPatientInfo] = useState(false); // For doctor's view of patient info
  const [isDoctorTyping, setIsDoctorTyping] = useState(false); // Doctor typing, not patient
  const [showChatListPane, setShowChatListPane] = useState(true); // Manage visibility of chat list on mobile
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentPatientMessages = doctorMessages[selectedPatientChat?.patientId] || [];

  const filteredPatientChats = patientChatList.filter(
    (chat) =>
      chat.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.condition && chat.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => { scrollToBottom(); }, [currentPatientMessages]);
  
  // Effect to manage chat list visibility on screen size change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setShowChatListPane(true);
      } else {
        // On smaller screens, if a chat is selected, hide the list. Otherwise show it.
        setShowChatListPane(selectedPatientChat === null);
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedPatientChat]);


  const handleSendMessage = () => {
    if (messageInput.trim() && selectedPatientChat) {
      const newMessage = {
        id: Date.now(), // Temporary ID
        senderId: "doctor-current", // Doctor is always the sender in this UI
        senderName: "Dr. Eve", // Placeholder doctor name
        message: messageInput.trim(),
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sent", // Initial status
      };
      // This would typically be an API call
      // For now, update local state:
      doctorMessages[selectedPatientChat.patientId] = [...(doctorMessages[selectedPatientChat.patientId] || []), newMessage];
      // Update last message in chatList (optional, for better UX)
      const chatIndex = patientChatList.findIndex(chat => chat.patientId === selectedPatientChat.patientId);
      if (chatIndex !== -1) {
        patientChatList[chatIndex].lastMessage = messageInput.trim();
        patientChatList[chatIndex].lastMessageTime = newMessage.timestamp;
      }
      
      setMessageInput("");
      // Potentially trigger a re-render if state isn't automatically picking up nested changes
      setSelectedPatientChat(prev => ({...prev})); // Force re-render of chat list if needed
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }};
  const handleFileUpload = () => { fileInputRef.current?.click(); };

  const getMessageStatus = (status) => {
    // Status of messages sent by the doctor
    switch (status) {
      case "sent": return <ClockIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />;
      case "delivered": return <CheckIcon className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />; // Single check for delivered
      case "read": return <div className="flex"><CheckIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /><CheckIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 -ml-1.5" /></div>; // Double check for read
      default: return null;
    }
  };
  
  const totalUnreadFromPatients = patientChatList.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Patient Chat List Sidebar */}
      <div
        className={`
          ${showChatListPane ? 'block' : 'hidden'} md:block 
          w-full md:w-2/5 lg:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-slate-700 flex flex-col 
          bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
          absolute md:relative inset-0 z-20 md:z-auto
          transition-transform duration-300 ease-in-out
          ${showChatListPane ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
             {selectedPatientChat && !showChatListPane && ( // Show back button only if list is hidden AND a chat is selected
                <button
                  onClick={() => setShowChatListPane(true)}
                  className="md:hidden p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Patient Messages</h1>
            </div>
            <div className="flex items-center space-x-2">
              {totalUnreadFromPatients > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-0.5">{totalUnreadFromPatients}</span>
              )}
              <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-sm dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredPatientChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-slate-400">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
              <p className="text-sm">No patient conversations found.</p>
            </div>
          ) : (
            filteredPatientChats.map((chat) => (
              <div key={chat.patientId} onClick={() => { setSelectedPatientChat(chat); if (window.innerWidth < 768) setShowChatListPane(false);}}
                className={`p-4 border-b border-gray-100 dark:border-slate-700/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-700/20 transition-colors ${selectedPatientChat?.patientId === chat.patientId ? "bg-blue-50 dark:bg-blue-700/20 border-r-4 border-r-blue-500 dark:border-r-blue-600" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img src={chat.patientAvatar || "https://via.placeholder.com/100/E0E0E0/B0B0B0?text=P"} alt={chat.patientName} className="w-11 h-11 rounded-full object-cover" />
                    {chat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{chat.patientName}</h3>
                      <div className="flex items-center space-x-1">
                        {chat.isUrgent && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" title="Urgent" />}
                        <span className="text-xs text-gray-500 dark:text-slate-400">{formatTime(chat.lastMessageTime)}</span>
                      </div>
                    </div>
                    {chat.condition && <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 truncate">{chat.condition}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 dark:text-slate-300 truncate flex-1">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && <span className="ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{chat.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 ${showChatListPane && selectedPatientChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedPatientChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <button onClick={() => setShowChatListPane(true)} className="md:hidden p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                  <div className="relative">
                    <img src={selectedPatientChat.patientAvatar || "https://via.placeholder.com/100/E0E0E0/B0B0B0?text=P"} alt={selectedPatientChat.patientName} className="w-10 h-10 rounded-full object-cover" />
                    {selectedPatientChat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{selectedPatientChat.patientName}</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{selectedPatientChat.isOnline ? 'Online' : selectedPatientChat.lastSeen} {selectedPatientChat.condition ? `• ${selectedPatientChat.condition}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Voice Call">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Video Call">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowPatientInfo(!showPatientInfo)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Patient Info">
                    <UserCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentPatientMessages.map((message, index) => {
                const isDoctor = message.senderId === "doctor-current";
                const showAvatar = index === 0 || currentPatientMessages[index - 1].senderId !== message.senderId || new Date(message.timestamp) - new Date(currentPatientMessages[index - 1].timestamp) > 300000;
                return (
                  <div key={message.id} className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end space-x-2 max-w-[80%] sm:max-w-md ${isDoctor ? "flex-row-reverse space-x-reverse" : ""}`}>
                      {!isDoctor && showAvatar && <img src={selectedPatientChat.patientAvatar || "https://via.placeholder.com/100/E0E0E0/B0B0B0?text=P"} alt={selectedPatientChat.patientName} className="w-8 h-8 rounded-full object-cover self-start"/>}
                      {!isDoctor && !showAvatar && <div className="w-8"></div>}
                      <div className={`flex flex-col ${isDoctor ? "items-end" : "items-start"}`}>
                        {showAvatar && <span className="text-xs text-gray-500 dark:text-slate-400 mb-1 px-2">{isDoctor ? "You" : message.senderName} • {formatMessageTime(message.timestamp)}</span>}
                        <div className={`rounded-2xl px-4 py-2.5 break-words ${isDoctor ? "bg-blue-500 text-white dark:bg-blue-600" : (message.type === "file" ? "bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600" : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600")}`}>
                          {message.type === "text" ? <p className={`text-sm ${isDoctor ? 'text-white' : 'text-gray-800 dark:text-slate-100'}`}>{message.message}</p>
                            : message.type === "file" ? 
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-600/40 rounded-lg"><DocumentIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" /></div>
                                <div><p className="text-sm font-medium text-gray-900 dark:text-slate-100">{message.fileName}</p><p className="text-xs text-gray-500 dark:text-slate-400">{message.fileSize}</p></div>
                            </div> : null
                          }
                        </div>
                        {isDoctor && <div className="flex items-center space-x-1 mt-1 px-2">{getMessageStatus(message.status)}<span className="text-xs text-gray-400 dark:text-slate-500">{formatMessageTime(message.timestamp)}</span></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isDoctorTyping && <div className="flex justify-start"><div className="flex items-end space-x-2 max-w-xs"><img src={selectedPatientChat.patientAvatar} className="w-8 h-8 rounded-full"/><div className="bg-white dark:bg-slate-700 border rounded-2xl p-3"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div></div></div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-end space-x-3">
                <button onClick={handleFileUpload} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"><PaperClipIcon className="w-5 h-5" /></button>
                <div className="flex-1 relative"><textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message to patient..." rows={1} className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-2xl resize-none text-sm dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent" style={{ minHeight: "46px", maxHeight: "120px" }}/></div>
                <button className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"><FaceSmileIcon className="w-5 h-5" /></button>
                <button onClick={handleSendMessage} disabled={!messageInput.trim()} className={`p-2.5 rounded-xl transition-colors ${messageInput.trim() ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" : "bg-gray-200 text-gray-400 dark:bg-slate-600 dark:text-slate-500 cursor-not-allowed"}`}><PaperAirplaneIcon className="w-5 h-5" /></button>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => console.log("File selected:", e.target.files[0])}/>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Select a Patient Conversation</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Choose a patient from the list to view messages or start a new chat.</p>
            </div>
          </div>
        )}
      </div>

      {/* Patient Info Sidebar (Doctor's View) */}
      {showPatientInfo && selectedPatientChat && (
        <div className="hidden md:block w-80 lg:w-96 border-l border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-6 overflow-y-auto shadow-xl rounded-tr-2xl rounded-br-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Patient Information</h3>
            <button onClick={() => setShowPatientInfo(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          <div className="text-center mb-6">
            <img src={selectedPatientChat.patientAvatar || "https://via.placeholder.com/150/E0E0E0/B0B0B0?text=P"} alt={selectedPatientChat.patientName} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 ring-2 ring-blue-200 dark:ring-blue-700 p-0.5" />
            <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedPatientChat.patientName}</h4>
            {selectedPatientChat.condition && <p className="text-sm text-blue-600 dark:text-blue-400">{selectedPatientChat.condition}</p>}
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Last seen: {selectedPatientChat.lastSeen}</p>
          </div>
          <div className="space-y-5">
            <div>
              <h5 className="font-medium text-gray-700 dark:text-slate-300 mb-2 text-sm">Quick Actions</h5>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-sm">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-200">View Full Patient Chart</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-sm">
                  <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-200">Schedule Follow-up</span>
                </button>
                 <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-sm">
                  <BriefcaseIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  <span className="text-gray-700 dark:text-slate-200">Create Prescription</span>
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 dark:text-slate-300 mb-2 text-sm">Shared Files</h5>
              {/* Placeholder - list actual shared files here */}
              <div className="text-xs text-gray-500 dark:text-slate-400 p-2 bg-gray-50 dark:bg-slate-700/30 rounded-md">No files shared in this view yet.</div>
            </div>
             <div>
              <h5 className="font-medium text-gray-700 dark:text-slate-300 mb-2 text-sm">Conversation Settings</h5>
                <label className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-700 dark:text-slate-300">Mute Notifications</span>
                  <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-slate-700 dark:checked:bg-blue-500"/>
                </label>
                 <button className="w-full mt-2 text-left p-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 rounded-lg transition-colors flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5"/>
                    <span>Report Conversation</span>
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages;
