import { ProductGET } from "@/library/types/graph";
import { create } from "zustand";

interface StoreState {
    selectedProducts: ProductGET[];
    addProductSelected: (product: ProductGET) => void;
    removeProductSelected: (productId: string) => void;
    setSelectedProducts: (products: ProductGET[]) => void;
}

const useBulkStore = create<StoreState>((set) => ({
    selectedProducts: [],
    addProductSelected: (product) =>
        set((state) => ({
            selectedProducts: [...state.selectedProducts, product],
        })),
    removeProductSelected: (productId) =>
        set((state) => ({
            selectedProducts: state.selectedProducts.filter((p) => p.id !== productId),
        })),
    setSelectedProducts: (products) => set({ selectedProducts: products }),
}));

export default useBulkStore;
