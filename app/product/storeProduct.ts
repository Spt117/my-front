import { create } from "zustand";

interface StoreState {
    price: string;
    setPrice: (price: string) => void;
    compareAtPrice: string;
    setCompareAtPrice: (price: string) => void;
    isUpdatingPrice: boolean;
    setIsUpdatingPrice: (isUpdating: boolean) => void;
    isChanged: boolean;
    setIsChanged: (isChanged: boolean) => void;
    newTitle: string;
    setNewTitle: (title: string) => void;
}

const useProductStore = create<StoreState>((set) => ({
    price: "0",
    setPrice: (price) => set({ price }),
    compareAtPrice: "0",
    setCompareAtPrice: (compareAtPrice) => set({ compareAtPrice }),
    isUpdatingPrice: false,
    setIsUpdatingPrice: (isUpdatingPrice) => set({ isUpdatingPrice }),
    isChanged: false,
    setIsChanged: (isChanged) => set({ isChanged }),
    newTitle: "",
    setNewTitle: (title) => set({ newTitle: title }),
}));

export default useProductStore;
