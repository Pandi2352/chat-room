import React, { useEffect, useRef, useState } from 'react';
import { 
    Send, Phone, Video, MoreVertical, Search, 
    Paperclip, Smile, Image as ImageIcon, Check, CheckCheck, Download 
} from 'lucide-react';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { getRoomName, getRoomAvatar, getOtherParticipant, isUserOnline } from '../../lib/chatUtils';

interface ChatWindowProps {
    activeRoom: any;
    user: any;
    messages: any[];
    msgInput: string;
    setMsgInput: (val: React.SetStateAction<string>) => void;
    sendMessage: (content: string) => void;
    sendTyping: (isTyping: boolean) => void;
    uploadFile: (file: File) => void;
    isUploading: boolean;
    typingUsers: Set<string>;
    onlineUsers: Set<string>;
    onToggleProfile: () => void;
}

export default function ChatWindow({ 
    activeRoom, user, messages, msgInput, setMsgInput, 
    sendMessage, sendTyping, uploadFile, isUploading, 
    typingUsers, onlineUsers, onToggleProfile 
}: ChatWindowProps) {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [showPicker, setShowPicker] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgInput.trim()) return;
        sendMessage(msgInput);
        setMsgInput('');
        sendTyping(false);
        setShowPicker(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // trigger submit
            if(msgInput.trim()) {
                sendMessage(msgInput);
                setMsgInput('');
                sendTyping(false);
                setShowPicker(false);
            }
        }
    }
    
    const onEmojiClick = (emojiData: any) => {
        setMsgInput((prev) => prev + emojiData.emoji);
        // keep picker open
    };

    if (!activeRoom) {
         return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10 animate-bounce">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to NovaChat</h2>
                <p className="max-w-md text-center mt-3 text-slate-500 font-medium">Select a conversation from the sidebar to start chatting or search for new friends.</p>
            </div>
         );
    }

    const otherParticipant = getOtherParticipant(activeRoom, user?._id);
    const isOnline = otherParticipant && isUserOnline(otherParticipant._id, onlineUsers);
    const isTyping = otherParticipant && typingUsers.has(otherParticipant._id);
    const avatar = getRoomAvatar(activeRoom, user?._id);
    const roomName = getRoomName(activeRoom, user?._id);

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#f8fafc]">
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/20 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="h-20 px-6 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-indigo-50/50 z-20 sticky top-0 shadow-sm shadow-indigo-100/10">
                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all duration-300 group" onClick={onToggleProfile}>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-[14px] bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 ring-4 ring-white overflow-hidden">
                             {otherParticipant?.avatarUrl ? (
                                <img src={otherParticipant.avatarUrl} alt={roomName} className="w-full h-full object-cover" />
                             ) : (
                                avatar
                             )}
                        </div>
                        {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-base tracking-tight leading-tight">{roomName}</h3>
                        {isTyping ? (
                             <span className="text-indigo-600 text-xs font-bold animate-pulse flex items-center gap-1">
                                 <div className="flex gap-0.5 mt-1">
                                    <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                    <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                 </div>
                             </span>
                        ) : (
                             <span className={`${isOnline ? 'text-emerald-500' : 'text-slate-400'} text-xs font-semibold flex items-center gap-1.5`}>
                                 {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                 {isOnline ? 'Active Now' : 'Offline'}
                             </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400">
                    <button className="p-2.5 rounded-xl hover:bg-slate-100/80 hover:text-indigo-600 transition-all active:scale-95"><Search size={20} strokeWidth={2} /></button>
                    <button className="p-2.5 rounded-xl hover:bg-slate-100/80 hover:text-indigo-600 transition-all active:scale-95"><Phone size={20} strokeWidth={2} /></button>
                    <button className="p-2.5 rounded-xl hover:bg-slate-100/80 hover:text-indigo-600 transition-all active:scale-95"><Video size={20} strokeWidth={2} /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button onClick={onToggleProfile} className="p-2.5 rounded-xl hover:bg-slate-100/80 hover:text-indigo-600 transition-all active:scale-95">
                        <MoreVertical size={20} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 z-10 scroll-smooth custom-scrollbar">
                <div className="flex justify-center my-6">
                    <span className="px-3 py-1 bg-slate-100/80 backdrop-blur-sm rounded-full text-[10px] uppercase font-bold text-slate-400 shadow-sm tracking-wider border border-white/50">Today</span>
                </div>

                {messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?._id;
                    const prevMsg = messages[idx - 1];
                    const isSequence = prevMsg && prevMsg.senderId === msg.senderId;
                    const sender = activeRoom?.participants?.find((p: any) => p._id === msg.senderId);

                    return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group ${isSequence ? 'mt-1' : 'mt-5'} animate-in slide-in-from-bottom-2 duration-300`}>
                            
                            {/* Avatar for Them */}
                            {!isMine && !isSequence && (
                                <div className="w-8 h-8 rounded-[10px] bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 mr-3 self-end shadow-sm mb-1 ring-2 ring-slate-50 overflow-hidden">
                                     {sender?.avatarUrl ? (
                                        <img src={sender.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                     ) : (
                                        getRoomAvatar(activeRoom, user?._id)[0]
                                     )}
                                </div>
                            )}
                            {!isMine && isSequence && <div className="w-11 mr-0"></div>}

                            <div className={`max-w-[75%] lg:max-w-[65%] p-4 px-5 shadow-sm text-[15px] leading-relaxed relative transition-all hover:shadow-md ${
                                isMine 
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[20px] rounded-tr-[4px] shadow-indigo-500/20' 
                                : 'bg-white text-slate-700 border border-slate-100 rounded-[20px] rounded-tl-[4px] shadow-slate-200/40'
                            }`}>
                                {msg.type === 'image' ? (
                                    <div className="relative group/img overflow-hidden rounded-xl -m-2">
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-10" />
                                        <img 
                                            src={msg.content} 
                                            alt="Shared" 
                                            className="max-w-xs h-auto cursor-zoom-in transition-transform duration-500 group-hover/img:scale-105"
                                            onClick={() => window.open(msg.content, '_blank')}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-8 bg-slate-50 text-slate-400 text-xs flex flex-col items-center gap-2"><span class="font-bold">Image Error</span><span>Failed to load</span></div>');
                                            }}
                                        />
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = document.createElement('a');
                                                link.href = msg.content;
                                                link.download = `image-${Date.now()}`;
                                                link.target = "_blank";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-20 backdrop-blur-sm shadow-sm"
                                            title="Download Image"
                                        >
                                            <Download size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                )}
                                
                                <div className={`flex justify-end items-center gap-1 mt-1.5 text-[10px] font-bold ${isMine ? 'text-indigo-200/80' : 'text-slate-300'}`}>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMine && (
                                        <span className={msg.status === 'read' ? 'text-emerald-300' : 'text-indigo-200/80'}>
                                            {msg.status === 'read' ? <CheckCheck size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 z-20 sticky bottom-0">
                <div className="max-w-4xl mx-auto relative group-focus-within:translate-y-0 transition-transform duration-300">
                    
                    {isUploading && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
                            <span className="bg-slate-800/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl shadow-slate-500/20 animate-bounce flex items-center gap-2 border border-white/10">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span> Uploading...
                            </span>
                        </div>
                    )}

                    {/* Glass Container wrapped in Form */}
                    <form onSubmit={handleSend} className="relative flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/50 p-2 pl-4 rounded-[24px] shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/15 focus-within:shadow-indigo-500/20 focus-within:bg-white focus-within:border-indigo-100 transition-all duration-300">
                        
                        <div className="flex items-center gap-1 text-slate-400">
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95 group/icon">
                                 <Paperclip size={20} className="group-hover/icon:rotate-45 transition-transform duration-300" strokeWidth={2} />
                             </button>
                             <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95 group/img">
                                 <ImageIcon size={20} className="group-hover/img:scale-110 transition-transform duration-300" strokeWidth={2} />
                             </button>
                             <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && uploadFile(e.target.files[0])} />
                             <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => e.target.files && uploadFile(e.target.files[0])} />
                        </div>

                        <div className="w-px h-8 bg-slate-200/60 mx-1"></div>

                        <input
                            type="text"
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 font-medium h-10 text-[15px]"
                        />

                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setShowPicker(!showPicker)}
                                className={`p-2 transition-colors rounded-xl active:scale-95 ${showPicker ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                            >
                                <Smile size={22} strokeWidth={2} />
                            </button>
                            
                            {showPicker && (
                                <div className="absolute bottom-16 right-0 z-50">
                                    <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                                        <EmojiPicker 
                                            onEmojiClick={onEmojiClick}
                                            autoFocusSearch={false}
                                            width={350}
                                            height={450}
                                            searchDisabled={false}
                                            skinTonesDisabled={false}
                                            emojiStyle={EmojiStyle.APPLE}
                                            lazyLoadEmojis={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={!msgInput.trim()}
                            className="w-11 h-11 flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-[18px] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
                        >
                            <Send size={20} className="translate-x-0.5" strokeWidth={2.5} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
