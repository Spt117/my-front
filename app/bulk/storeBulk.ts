import { ProductGET } from "@/library/types/graph";
import { create } from "zustand";

export interface IDataUpdate {
    id: string;
    canaux: { id: string; isPublished: boolean; name: string }[];
}

interface StoreState {
    selectedProducts: ProductGET[];
    addProductSelected: (product: ProductGET) => void;
    removeProductSelected: (productId: string) => void;
    setSelectedProducts: (products: ProductGET[]) => void;
    filteredProducts: ProductGET[];
    setFilteredProducts: (products: ProductGET[]) => void;
    filterByTag: string;
    setFilterByTag: (tag: string) => void;
    dataUpdate: IDataUpdate[];
    addDataUpdate: (data: IDataUpdate) => void;
    removeDataUpdate: (productId: string) => void;
    setDataUpdate: (data: IDataUpdate[]) => void;
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
    filteredProducts: [],
    setFilteredProducts: (products) => set({ filteredProducts: products }),
    filterByTag: "",
    setFilterByTag: (tag) => set({ filterByTag: tag }),
    dataUpdate: [],
    addDataUpdate: (data) =>
        set((state) => ({
            dataUpdate: [...state.dataUpdate, data],
        })),
    removeDataUpdate: (productId) =>
        set((state) => ({
            dataUpdate: state.dataUpdate.filter((d) => d.id !== productId),
        })),
    setDataUpdate: (data) => set({ dataUpdate: data }),
}));

export default useBulkStore;
