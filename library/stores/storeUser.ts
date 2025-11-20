import { Socket } from "socket.io-client";
import { create } from "zustand";

interface StoreState {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
}

const useUserStore = create<StoreState>((set) => ({
    socket: null,
    setSocket: (socket: Socket) => set({ socket }),
}));

export default useUserStore;
