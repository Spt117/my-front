import { create } from "zustand";

interface StoreState {
    loadingSave: boolean;
    setLoadingSave: (loading: boolean) => void;
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
    addProductDialogOpen: boolean;
    openAddProductDialog: () => void;
    closeAddProductDialog: () => void;
}

const useProductStore = create<StoreState>((set) => ({
    loadingSave: false,
    setLoadingSave: (loading) => set({ loadingSave: loading }),
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
    addProductDialogOpen: false,
    openAddProductDialog: () => set({ addProductDialogOpen: true }),
    closeAddProductDialog: () => set({ addProductDialogOpen: false }),
}));

export default useProductStore;
