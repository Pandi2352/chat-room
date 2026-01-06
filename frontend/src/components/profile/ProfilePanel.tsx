import React from 'react';
import { X, UserPlus, Heart, Ban, LogOut, Phone, MessageSquare, Search } from 'lucide-react';
import { getRoomName, getRoomAvatar, getOtherParticipant } from '../../lib/chatUtils';

interface ProfilePanelProps {
    isOpen: boolean;
    activeRoom: any;
    currentUserId?: string;
    onClose: () => void;
}

export default function ProfilePanel({ isOpen, activeRoom, currentUserId, onClose }: ProfilePanelProps) {
    if (!isOpen || !activeRoom) return null;

    const otherUser = getOtherParticipant(activeRoom, currentUserId);
    const roomName = getRoomName(activeRoom, currentUserId);
    const avatar = getRoomAvatar(activeRoom, currentUserId);

    return (
        <div className="w-80 bg-white/80 backdrop-blur-md border-l border-white/20 h-full flex flex-col shadow-xl z-20 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-20 px-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
                <h3 className="font-bold text-slate-700">Profile Details</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Hero */}
                <div className="p-8 flex flex-col items-center border-b border-gray-100 bg-gradient-to-b from-white to-slate-50/50">
                    <div className="w-28 h-28 rounded-full bg-slate-200 mb-5 overflow-hidden ring-4 ring-white shadow-xl relative group cursor-pointer">
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold select-none">
                            {avatar}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{roomName}</h3>
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-semibold text-slate-500">Active Now</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">{otherUser?.location || 'Unknown Location'}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                        <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm">
                            <UserPlus size={20} />
                        </button>
                        <button className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                            <Heart size={20} fill="currentColor" />
                        </button>
                        <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                            <Ban size={20} />
                        </button>
                    </div>
                </div>

                {/* User Info List */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">User Information</h4>
                        <LogOut size={14} className="text-slate-300 hover:text-slate-500 cursor-pointer" />
                    </div>

                    <div className="space-y-6">
                        <InfoItem icon={<Phone size={18} />} label="Phone" value={otherUser?.phone} />
                        <InfoItem icon={<MessageSquare size={18} />} label="Email" value={otherUser?.email} />
                        <InfoItem icon={<Search size={18} />} label="Address" value={otherUser?.address} />
                    </div>
                </div>

                {/* Media Section */}
                <div className="p-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Shared Media</h4>
                         <button className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value?: string }) {
    return (
        <div className="flex items-start gap-4 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-slate-700 font-medium break-all leading-relaxed">{value || 'N/A'}</p>
            </div>
        </div>
    );
}
