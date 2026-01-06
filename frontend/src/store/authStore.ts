
import { create } from 'zustand';

interface User {
    _id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
    location?: string;
    about?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    setAuth: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
    },
    updateUser: (user) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Use updatedUser here!
        set({ user: updatedUser });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));
