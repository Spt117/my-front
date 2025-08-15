import { create } from "zustand";
import { TUser } from "../models/user/userType";

interface StoreState {
    user: TUser | null;
    setUser: (param: TUser | null) => void;
    setCard: (param: string) => void;
    card: string | null;
}

const useUserStore = create<StoreState>((set) => ({
    user: null,
    setUser: (param: TUser | null) => set({ user: param }),
    card: null,
    setCard: (param: string) => set({ card: param }),
}));

export default useUserStore;
