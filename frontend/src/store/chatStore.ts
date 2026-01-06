
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import apiClient from '../lib/apiClient';
import { useAuthStore } from './authStore';

interface Message {
    _id: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image';
    status?: 'sent' | 'delivered' | 'read';
    createdAt: string;
}

interface Room {
    _id: string;
    participants: any[]; // refine later
    lastMessage?: Message;
}

interface ChatState {
    socket: Socket | null;
    rooms: Room[];
    messages: Message[];
    activeRoom: Room | null;
    typingUsers: Set<string>;
    onlineUsers: Set<string>;
    isUploading: boolean;
    connectSocket: () => void;
    disconnectSocket: () => void;
    fetchRooms: () => Promise<void>;
    setActiveRoom: (room: Room) => void;
    fetchMessages: (roomId: string) => Promise<void>;
    sendMessage: (content: string, type?: 'text' | 'image') => void;
    uploadFile: (file: File) => Promise<void>;
    joinRoom: (roomId: string) => void;
    sendTyping: (isTyping: boolean) => void;
    markAsRead: (roomId: string) => void;
    // Video Call
    callData: { isReceivingCall: boolean; from: string; name: string; signal: any } | null;
    callAccepted: boolean;
    setCallData: (data: any) => void;
    setCallAccepted: (val: boolean) => void;
    emitCallUser: (data: any) => void;
    emitAnswerCall: (data: any) => void;
    emitIceCandidate: (data: any) => void;
    emitEndCall: (data: any) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    rooms: [],
    messages: [],
    activeRoom: null,

    typingUsers: new Set<string>(),
    onlineUsers: new Set<string>(),
    isUploading: false,

    connectSocket: () => {
        const token = useAuthStore.getState().user?._id ? useAuthStore.getState().token : null;
        if (!token) return;

        // Request Notification Permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            auth: { token },
        });

        socket.on('connect', () => {
            console.log('Connected to socket');
        });

        socket.on('receive_message', (message) => {
            const { activeRoom } = get();
            const user = useAuthStore.getState().user;

            // Check if message is from someone else
            if (user && message.senderId !== user._id) {
                // Play Sound
                const audio = new Audio('/notification.mp3'); // Create this file or assume it exists
                audio.play().catch(e => console.log('Audio play failed', e));

                // Browser Notification
                if (document.hidden || activeRoom?._id !== message.roomId) {
                    if (Notification.permission === 'granted') {
                        new Notification('New Message', {
                            body: message.type === 'image' ? 'Sent an image' : message.content,
                            icon: '/vite.svg' // Placeholder icon
                        });
                    }
                }
            }

            if (activeRoom?._id === message.roomId) {
                set((state) => ({ messages: [...state.messages, message] }));
            }
            // Update last message in room list
            set((state) => ({
                rooms: state.rooms.map(r => r._id === message.roomId ? { ...r, lastMessage: message } : r)
            }));
        });

        socket.on('user_typing', ({ roomId, userId, isTyping }) => {
            const activeRoom = get().activeRoom;
            if (activeRoom?._id === roomId) {
                set((state) => {
                    const newTyping = new Set(state.typingUsers);
                    if (isTyping) newTyping.add(userId);
                    else newTyping.delete(userId);
                    return { typingUsers: newTyping };
                });
            }
        });

        socket.on('user_status', ({ userId, status }) => {
            set((state) => {
                const newOnline = new Set(state.onlineUsers);
                if (status === 'online') newOnline.add(userId);
                else newOnline.delete(userId);
                return { onlineUsers: newOnline };
            });
        });

        socket.on('messages_read', ({ roomId }) => { // simplified for now, usually updates specific messages
            // Update all local messages in this room to 'read' if they aren't already
            const { activeRoom } = get();
            if (activeRoom?._id === roomId) {
                set(state => ({
                    messages: state.messages.map(m => ({ ...m, status: 'read' as const })) // Using 'as const' to satisfy union type if strict
                }));
            }
        });

        socket.on('call_incoming', (data) => {
            set({ callData: { isReceivingCall: true, from: data.from, name: data.name, signal: data.signal } });
        });

        socket.on('call_ended', () => {
            set({ callData: null, callAccepted: false });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        get().socket?.disconnect();
        set({ socket: null });
    },

    fetchRooms: async () => {
        try {
            const res = await apiClient.get('/rooms');
            const rooms = res.data;
            set({ rooms });

            // Initialize online users from room participants
            const online = new Set<string>();
            rooms.forEach((r: any) => {
                r.participants.forEach((p: any) => {
                    if (p.status === 'online') online.add(p._id);
                });
            });
            set({ onlineUsers: online });

        } catch (error) {
            console.error('Failed to fetch rooms', error);
        }
    },

    setActiveRoom: (room) => {
        set({ activeRoom: room, typingUsers: new Set() }); // Clear typing when switching
        get().joinRoom(room._id);
        get().fetchMessages(room._id);
    },

    joinRoom: (roomId) => {
        get().socket?.emit('join_room', roomId);
    },

    fetchMessages: async (roomId) => {
        try {
            const res = await apiClient.get(`/messages/${roomId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    },

    sendMessage: (content, type = 'text') => {
        const { socket, activeRoom } = get();
        const user = useAuthStore.getState().user;
        if (!socket || !activeRoom || !user) return;

        const payload = {
            roomId: activeRoom._id,
            senderId: user._id,
            content,
            type,
        };
        socket.emit('send_message', payload);
    },

    uploadFile: async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        set({ isUploading: true });
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { path } = res.data;
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            const fullUrl = `${baseUrl}${path}`;
            get().sendMessage(fullUrl, 'image');
        } catch (error) {
            console.error('File upload failed', error);
        } finally {
            set({ isUploading: false });
        }
    },

    sendTyping: (isTyping) => {
        const { socket, activeRoom } = get();
        if (!socket || !activeRoom) return;
        socket.emit('typing', { roomId: activeRoom._id, isTyping });
    },

    markAsRead: (roomId: string) => {
        const { socket } = get();
        if (!socket) return;
        socket.emit('mark_read', { roomId });
    },

    // --- Video Call State ---
    callData: null,
    callAccepted: false,
    setCallData: (data) => set({ callData: data }),
    setCallAccepted: (val) => set({ callAccepted: val }),

    // Simple signaling helpers for components to use
    emitCallUser: (data) => get().socket?.emit('call_user', data),
    emitAnswerCall: (data) => get().socket?.emit('answer_call', data),
    emitIceCandidate: (data) => get().socket?.emit('ice_candidate', data),
    emitEndCall: (data) => get().socket?.emit('end_call', data),
}));
