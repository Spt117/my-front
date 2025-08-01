import { create } from "zustand";
import { TUser } from "../models/user/userType";

interface StoreState {
    user: TUser | null;
    setUser: (param: TUser | null) => void;
}

const useUserStore = create<StoreState>((set) => ({
    user: null,
    setUser: (param: TUser | null) => set({ user: param }),
}));

export default useUserStore;
