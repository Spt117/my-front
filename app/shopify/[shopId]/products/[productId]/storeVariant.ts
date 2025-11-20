import { create } from "zustand";

interface StoreState {
    sku: string;
    setSku: (sku: string) => void;
}

const useVariantStore = create<StoreState>((set) => ({
    sku: "",
    setSku: (sku) => set({ sku }),
}));

export default useVariantStore;
