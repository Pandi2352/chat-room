import { Bell, MoreVertical, ChevronDown, Search, Edit2, LogOut } from 'lucide-react';
import { getRoomName, getRoomAvatar, isUserOnline } from '../../lib/chatUtils';

interface ChatSidebarProps {
    user: any;
    rooms: any[];
    activeRoom: any;
    onlineUsers: Set<string>;
    searchTerm: string;
    searchResults: any[];
    onSearch: (query: string) => void;
    onSelectRoom: (room: any) => void;
    onStartChat: (user: any) => void;
    onEditProfile: () => void;
    onLogout: () => void;
}

export default function ChatSidebar({ 
    user, rooms, activeRoom, onlineUsers,
    searchTerm, searchResults, onSearch, 
    onSelectRoom, onStartChat, onEditProfile, onLogout 
}: ChatSidebarProps) {
    
    return (
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 relative">
            
            {/* Header */}
            <div className="h-20 px-6 flex justify-between items-center border-b border-gray-50/50">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chats</h2>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">{rooms.length}</span>
                </div>
                <div className="flex gap-1 text-slate-400">
                    <button className="p-2 rounded-full hover:bg-slate-50 transition-colors"><Bell size={18} /></button>
                    <button className="p-2 rounded-full hover:bg-slate-50 transition-colors"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="px-5 pt-5 pb-2">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                    />

                    {/* Search Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-30 divide-y divide-gray-50">
                            {searchResults.map(u => (
                                <div 
                                    key={u._id} 
                                    onClick={() => onStartChat(u)}
                                    className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {u.displayName[0]}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{u.displayName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                        All Chats <ChevronDown size={12} />
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                        Groups
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                        Unread
                    </button>
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                {rooms.map((room) => {
                    const isActive = activeRoom?._id === room._id;
                    const name = getRoomName(room, user?._id);
                    const avatar = getRoomAvatar(room, user?._id);
                    const otherUser = room.participants.find((p: any) => p._id !== user?._id); // quick lookup for status
                    const isOnline = otherUser && isUserOnline(otherUser._id, onlineUsers);

                    return (
                        <div 
                            key={room._id}
                            onClick={() => onSelectRoom(room)}
                            className={`group p-3 rounded-2xl flex items-center cursor-pointer transition-all border border-transparent ${
                                isActive 
                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20' 
                                    : 'hover:bg-slate-50 hover:border-slate-100'
                            }`}
                        >
                            <div className="relative mr-3.5">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-sm ${
                                    isActive 
                                        ? 'bg-white/20 border-white/30 text-white' 
                                        : 'bg-white border-slate-100 text-slate-600'
                                }`}>
                                    {avatar}
                                </div>
                                {isOnline && (
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 rounded-full ${isActive ? 'border-indigo-600' : 'border-white'}`}></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                        {name}
                                    </h3>
                                    <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        12:45 PM
                                    </span>
                                </div>
                                <p className={`text-xs truncate font-medium ${isActive ? 'text-indigo-100/90' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                    {room.lastMessage ? room.lastMessage.content : <span className="italic opacity-80">Start a conversation</span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onEditProfile}>
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm relative overflow-hidden group">
                           {user?.displayName?.[0]}
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Edit2 size={12} />
                           </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{user?.displayName}</span>
                            <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                            </span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
