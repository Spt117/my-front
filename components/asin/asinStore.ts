import { TAsin } from "@/library/models/asins/asinType";
import { create } from "zustand";

interface StoreState {
    asins: TAsin[][];
    setAsins: (asins: TAsin[][]) => void;
}

const useAsinStore = create<StoreState>((set) => ({
    asins: [],
    setAsins: (asins: TAsin[][]) => set({ asins }),
}));

export default useAsinStore;
