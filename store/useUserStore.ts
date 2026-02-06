import { create } from 'zustand';

interface UserState {
    userId: string | null;
    role: string | null;
    isOnline: boolean;
    socketConnected: boolean;

    // Actions
    setUser: (id: string, role: string) => void;
    logout: () => void;
    setOnline: () => void;
    setOffline: () => void;
    setSocketConnected: (connected: boolean) => void;

    // Initialize from LocalStorage (Helper)
    initialize: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    userId: null,
    role: null,
    isOnline: false,
    socketConnected: false,

    setUser: (id, role) => {
        localStorage.setItem('user_id', id);
        localStorage.setItem('role', role);
        localStorage.setItem('is_auth', 'true');
        set({ userId: id, role });
    },

    logout: () => {
        localStorage.clear();
        set({ userId: null, role: null, isOnline: false, socketConnected: false });
    },

    setOnline: () => set({ isOnline: true }),
    setOffline: () => set({ isOnline: false }),
    setSocketConnected: (connected) => set({ socketConnected: connected }),

    initialize: () => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('user_id');
            const role = localStorage.getItem('role');
            if (id && role) {
                set({ userId: id, role });
            }
        }
    }
}));
