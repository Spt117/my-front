import { create } from "zustand";

interface StoreState {
    messages: string[];
    addMessage: (message: string) => void;
    deleteFirstMessage: () => void;
}

const useNotificationStore = create<StoreState>((set) => ({
    messages: [],
    addMessage: (message: string) => set((state) => ({ messages: [...state.messages, message] })),
    deleteFirstMessage: () => set((state) => ({ messages: state.messages.slice(1) })),
}));

export default useNotificationStore;
