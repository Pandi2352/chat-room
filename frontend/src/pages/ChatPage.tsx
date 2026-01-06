import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { 
  Send, Search, LogOut, MessageSquare, 
  Phone, Video, MoreVertical, X,
  Paperclip, Smile, Image as ImageIcon,
  UserPlus, Heart, Ban, ChevronDown, Bell, Edit2, Check, CheckCheck
} from 'lucide-react'; // Added more icons
import apiClient from '../lib/apiClient';

export default function ChatPage() {
  const { 
    connectSocket, disconnectSocket, 
    fetchRooms, rooms, 
    activeRoom, setActiveRoom, 
    messages, sendMessage,
    sendTyping, typingUsers, onlineUsers, uploadFile, isUploading, markAsRead
  } = useChatStore();
  
  const { user, logout, updateUser } = useAuthStore();
  const [msgInput, setMsgInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(true); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phone: '',
    address: '',
    location: '',
    about: ''
  });

  useEffect(() => {
    connectSocket();
    fetchRooms();
    return () => disconnectSocket();
  }, []);

  // Initialize form with user data when opening modal
  useEffect(() => {
    if (isEditingProfile && user) {
        setEditForm({
            displayName: user.displayName || '',
            phone: user.phone || '',
            address: user.address || '',
            location: user.location || '',
            about: user.about || ''
        });
    }
  }, [isEditingProfile, user]);

  // Debounce typing & Read Receipt
  useEffect(() => {
     if (activeRoom) {
         markAsRead(activeRoom._id); // Mark read on enter
         
         sendTyping(!!msgInput);
         const timeout = setTimeout(() => sendTyping(false), 3000);
         return () => clearTimeout(timeout);
     }
  }, [msgInput, activeRoom, messages.length]); // Re-run when new messages arrive

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    sendMessage(msgInput);
    setMsgInput('');
    sendTyping(false);
  };

  // Helper to check online status
  const isOnline = (userId: string) => onlineUsers.has(userId);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await apiClient.get(`/users/search?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async (targetUser: any) => {
      const res = await apiClient.post('/rooms', { targetUserId: targetUser._id });
      await fetchRooms();
      setActiveRoom(res.data); 
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await apiClient.put('/users/profile', editForm);
          updateUser(res.data);
          setIsEditingProfile(false);
      } catch (err) {
          console.error("Failed to update profile", err);
          alert("Failed to update profile");
      }
  };

  // Helper to get other participant
  const getOtherParticipant = (room: any) => {
    if (room.type === 'private') {
      return room.participants.find((p: any) => p._id !== user?._id);
    }
    return null;
  };

  const getRoomName = (room: any) => {
    const other = getOtherParticipant(room);
    return other?.displayName || room.name || 'Unknown User';
  };

  const getRoomAvatar = (room: any) => {
     const other = getOtherParticipant(room);
     return other?.displayName?.[0] || '?';
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans relative">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        
        {/* Header: Chats Title & Bell */}
        <div className="p-5 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
          <div className="flex gap-2 text-gray-400">
             <Bell size={20} className="hover:text-gray-600 cursor-pointer" />
             <MoreVertical size={20} className="hover:text-gray-600 cursor-pointer" />
          </div>
        </div>

        {/* Filter and Search */}
        <div className="px-5 pb-2">
            <div className="flex gap-2 mb-4">
               <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200">
                  All Chats <ChevronDown size={14} />
               </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm bg-gray-50 focus:bg-white transition-all"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                  {searchResults.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => startChat(u)}
                      className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {u.displayName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{u.displayName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {rooms.map((room) => {
            const isActive = activeRoom?._id === room._id;
            return (
              <div 
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className={`p-3 rounded-xl flex items-center cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md text-white' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mr-3 border-2 ${isActive ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-100 border-white text-gray-500'}`}>
                  {getRoomAvatar(room)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {getRoomName(room)}
                    </h3>
                    <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                        Just now
                    </span>
                  </div>
                  <p className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {room.lastMessage ? room.lastMessage.content : 'Start a conversation'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* User Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 group">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                 <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold relative">
                     {user?.displayName[0]}
                     <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={12} className="text-white" />
                     </div>
                 </div>
                 <div className="text-xs">
                     <div className="font-bold text-gray-700">{user?.displayName}</div>
                     <div className="text-green-500 flex items-center gap-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${isOnline(user?._id || '') ? 'bg-green-500' : 'bg-gray-400'}`}></div> 
                         {isOnline(user?._id || '') ? 'Online' : 'Offline'}
                     </div>
                 </div>
             </div>
             <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                 <LogOut size={16} />
             </button>
        </div>
      </div>

      {/* ---------------- CENTER CHAT AREA ---------------- */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col bg-white relative">
          
          {/* Header */}
          <div className="h-20 px-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                   {getRoomAvatar(activeRoom)}
               </div>
               <div>
                   <h3 className="font-bold text-gray-800 text-base">{getRoomName(activeRoom)}</h3>
                   {getOtherParticipant(activeRoom) && typingUsers.has(getOtherParticipant(activeRoom)._id) ? (
                        <span className="text-indigo-500 text-xs font-bold animate-pulse">Typing...</span>
                   ) : (
                        <span className={`${isOnline(getOtherParticipant(activeRoom)?._id) ? 'text-green-500' : 'text-gray-400'} text-xs font-medium`}>
                            {isOnline(getOtherParticipant(activeRoom)?._id) ? 'Online' : 'Offline'}
                        </span>
                   )}
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-400">
               <Search size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
               <Phone size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
               <Video size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
               <div className="w-px h-6 bg-gray-200 mx-2"></div>
               <button onClick={() => setShowProfile(!showProfile)}>
                   <MoreVertical size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
               </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            
            {/* Date Divider Example */}
            <div className="flex justify-center my-4">
                <span className="px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">Today</span>
            </div>

            {messages.map((msg) => {
              const isMine = msg.senderId === user?._id;
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                  
                  {/* Avatar for Them */}
                  {!isMine && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-2 self-end mb-1"></div>
                  )}

                  <div className={`max-w-[65%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isMine 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-700 rounded-bl-none'
                  }`}>
                    {/* Image Attachment Placeholder if needed */}
                    {/* <div className="grid grid-cols-2 gap-2 mb-2"> ...images... </div> */}
                    
                    {msg.type === 'image' ? (
                        <img src={msg.content} alt="Shared image" className="rounded-lg max-w-full h-auto mb-1" />
                    ) : (
                        <p>{msg.content}</p>
                    )}
                    
                    {/* Time & Status */}
                    <div className={`flex justify-end items-center gap-1 mt-1 text-[10px] ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>
                       <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {isMine && (
                          <span>
                              {msg.status === 'read' ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} />}
                          </span>
                       )}
                    </div>
                  </div>

                   {/* Avatar for Me (Optional, image shows none for me usually, but lets stick to standard) */}
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white relative">
            {isUploading && (
                 <div className="absolute top-0 left-0 right-0 -mt-8 flex justify-center">
                      <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-md animate-pulse">Uploading...</span>
                 </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                
                {/* Attachment Bar */}
                <div className="flex items-center gap-2 text-gray-400 absolute left-4 z-10">
                     <label className="cursor-pointer hover:text-indigo-600">
                         <Paperclip size={20} />
                         <input type="file" className="hidden" onChange={(e) => {
                             if(e.target.files) uploadFile(e.target.files[0]);
                         }} />
                     </label>
                     <label className="cursor-pointer hover:text-indigo-600">
                         <ImageIcon size={20} />
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                             if(e.target.files) uploadFile(e.target.files[0]);
                         }} />
                     </label>
                </div>

                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full pl-24 pr-12 py-4 bg-gray-50 rounded-full border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-gray-700 placeholder-gray-400"
                />

                <div className="absolute right-16 text-gray-400 hover:text-yellow-500 cursor-pointer">
                    <Smile size={20} />
                </div>

                <button 
                  type="submit" 
                  className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                  disabled={!msgInput.trim()}
                >
                  <Send size={20} className="ml-0.5" />
                </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
           <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <MessageSquare size={48} className="text-gray-300" />
           </div>
           <h2 className="text-2xl font-bold text-gray-700">Welcome to NovaChat</h2>
           <p className="max-w-md text-center mt-2 text-gray-500">Select a conversation from the sidebar to start chatting or search for new friends.</p>
        </div>
      )}

      {/* ---------------- RIGHT SIDEBAR (PROFILE) ---------------- */}
      {showProfile && activeRoom && (
         <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-20 px-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700">Profile Details</h3>
                 <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600">
                     <X size={20} />
                 </button>
            </div>

            {/* Profile Info */}
            <div className="p-6 flex flex-col items-center border-b border-gray-50">
                 <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg">
                      {/* Placeholder Image */}
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
                          {getRoomAvatar(activeRoom)}
                      </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-1">{getRoomName(activeRoom)}</h3>
                 <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active Now
                 </p>
                 <p className="text-xs text-gray-400 mt-1">{getOtherParticipant(activeRoom)?.location || 'Unknown Location'}</p>

                 {/* Action Buttons */}
                 <div className="flex gap-4 mt-6">
                     <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                         <UserPlus size={18} />
                     </button>
                     <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                         <Heart size={18} fill="currentColor" /> 
                     </button>
                     <button className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                         <Ban size={18} />
                     </button>
                 </div>
            </div>

            {/* Creating User Information Section */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-700 text-sm">User Information</h4>
                    <LogOut size={16} className="text-gray-300" /> 
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                         <div className="mt-1"><Phone size={16} className="text-gray-400" /></div>
                         <div>
                             <p className="text-xs text-gray-400 uppercase font-semibold">Phone</p>
                             <p className="text-sm text-gray-700 font-medium">{getOtherParticipant(activeRoom)?.phone || 'N/A'}</p>
                         </div>
                    </div>

                    <div className="flex items-start gap-3">
                         <div className="mt-1"><MessageSquare size={16} className="text-gray-400" /></div>
                         <div>
                             <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
                             <p className="text-sm text-gray-700 font-medium break-all">{getOtherParticipant(activeRoom)?.email || 'N/A'}</p>
                         </div>
                    </div>

                    <div className="flex items-start gap-3">
                         <div className="mt-1"><Search size={16} className="text-gray-400" /></div>
                         <div>
                             <p className="text-xs text-gray-400 uppercase font-semibold">Address</p>
                             <p className="text-sm text-gray-700 font-medium">{getOtherParticipant(activeRoom)?.address || 'N/A'}</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Media Section Placeholder */}
             <div className="p-6 border-t border-gray-50">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-700 text-sm">Shared Media</h4>
                    <span className="text-xs text-indigo-600 font-bold cursor-pointer">View All</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                     <div className="aspect-square bg-gray-100 rounded-lg"></div>
                     <div className="aspect-square bg-gray-100 rounded-lg"></div>
                     <div className="aspect-square bg-gray-100 rounded-lg"></div>
                </div>
             </div>
         </div>
      )}

      {/* ---------------- EDIT PROFILE MODAL ---------------- */}
      {isEditingProfile && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
                      <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Display Name</label>
                          <input 
                              type="text" 
                              value={editForm.displayName} 
                              onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                              className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              placeholder="Your Name"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                          <input 
                              type="text" 
                              value={editForm.phone} 
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              placeholder="+1 234 567 8900"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
                          <input 
                              type="text" 
                              value={editForm.location} 
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              placeholder="City, Country"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                          <textarea 
                              value={editForm.address} 
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              className="w-full p-2.5 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                              placeholder="Full Address"
                              rows={2}
                          />
                      </div>

                      <button 
                          type="submit" 
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                          Save Changes
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
