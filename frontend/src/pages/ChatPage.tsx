import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import apiClient from '../lib/apiClient';
import { getOtherParticipant } from '../lib/chatUtils';

// Components
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ProfilePanel from '../components/profile/ProfilePanel';
import EditProfileModal from '../components/profile/EditProfileModal';
import VideoCall from '../components/chat/VideoCall';

export default function ChatPage() {
  const { 
    connectSocket, disconnectSocket, 
    fetchRooms, rooms, 
    activeRoom, setActiveRoom, 
    messages, sendMessage,
    sendTyping, typingUsers, onlineUsers, uploadFile, isUploading, markAsRead,
    setCallData
  } = useChatStore();
  
  const { user, logout, updateUser } = useAuthStore();
  
  // Local UI State
  const [msgInput, setMsgInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    connectSocket();
    fetchRooms();
    return () => disconnectSocket();
  }, []);

  // Debounce typing & Read Receipt
  useEffect(() => {
     if (activeRoom) {
         markAsRead(activeRoom._id); 
         
         sendTyping(!!msgInput);
         const timeout = setTimeout(() => sendTyping(false), 3000);
         return () => clearTimeout(timeout);
     }
  }, [msgInput, activeRoom, messages.length]);

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
    try {
      const res = await apiClient.post('/rooms', { targetUserId: targetUser._id });
      await fetchRooms();
      setActiveRoom(res.data); 
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (formData: any) => {
      try {
          const res = await apiClient.put('/users/profile', formData);
          updateUser(res.data);
      } catch (err) {
          console.error("Failed to update profile", err);
          alert("Failed to update profile");
      }
  };

  const handleVideoCall = () => {
       if (!activeRoom || !user) return;
       const other = getOtherParticipant(activeRoom, user._id);
       if (other) {
           setCallData({ 
               isReceivingCall: false, 
               userToCall: other._id, 
               name: other.displayName || 'User' 
           });
       }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <ChatSidebar 
        user={user}
        rooms={rooms}
        activeRoom={activeRoom}
        onlineUsers={onlineUsers}
        searchTerm={searchTerm}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectRoom={setActiveRoom}
        onStartChat={startChat}
        onEditProfile={() => setIsEditingProfile(true)}
        onLogout={logout}
      />

      {/* Main Chat Window */}
      <div className="flex-1 flex relative">
        <ChatWindow 
          activeRoom={activeRoom}
          user={user}
          messages={messages}
          msgInput={msgInput}
          setMsgInput={setMsgInput}
          sendMessage={sendMessage}
          sendTyping={sendTyping}
          uploadFile={uploadFile}
          isUploading={isUploading}
          typingUsers={typingUsers}
          onlineUsers={onlineUsers}
          onToggleProfile={() => setShowProfile(!showProfile)}
          onVideoCall={handleVideoCall}
        />

        {/* Right Information Panel */}
        {showProfile && activeRoom && (
            <ProfilePanel 
                isOpen={showProfile}
                activeRoom={activeRoom}
                currentUserId={user?._id}
                onClose={() => setShowProfile(false)}
            />
        )}
      </div>

      {/* Modals */}
      <VideoCall />
      <EditProfileModal 
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />

    </div>
  );
}
