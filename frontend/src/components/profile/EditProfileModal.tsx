import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react'; // Added icons
import apiClient from '../../lib/apiClient';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdate: (data: any) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
    // const fileInputRef = useRef<HTMLInputElement>(null); // Removed: using htmlFor
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        location: '',
        address: '',
        about: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                displayName: user.displayName || '',
                phone: user.phone || '',
                location: user.location || '',
                address: user.address || '',
                about: user.about || '',
                avatarUrl: user.avatarUrl || ''
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(formData);
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await apiClient.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Construct full URL if response is relative path, or use as is if logic handles it
            // Backend seems to return { path: '/uploads/...' }
            const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${res.data.path}`;
            setFormData(prev => ({ ...prev, avatarUrl: fullUrl }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Edit Profile</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center mb-6">
                        <label 
                            htmlFor="avatar-upload" 
                            className="relative group cursor-pointer block"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative z-0">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                                        {formData.displayName?.[0]}
                                    </div>
                                )}
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10">
                                    <Upload className="text-white" size={24} />
                                </div>
                            </div>
                            
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full z-20">
                                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                                </div>
                            )}
                        </label>
                        
                        <label 
                            htmlFor="avatar-upload" 
                            className="mt-3 text-sm text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer"
                        >
                            Change Photo
                        </label>
                        
                        <input 
                            id="avatar-upload"
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">About / Status</label>
                        <input
                            type="text"
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                            placeholder="Hey there! I am using NovaChat."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                            placeholder="Street Address"
                        />
                    </div>

                    <hr className="border-slate-100" />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
