import { ProductGET } from "@/library/types/graph";
import { create } from "zustand";
import { BulkFilters, BulkSort, DEFAULT_FILTERS, DEFAULT_SORT } from "./bulkQuery";

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
    dataUpdate: IDataUpdate[];
    addDataUpdate: (data: IDataUpdate) => void;
    removeDataUpdate: (productId: string) => void;
    setDataUpdate: (data: IDataUpdate[]) => void;

    // Filter Builder (étape 2 — pas encore branché à la UI ; étape 3)
    filters: BulkFilters;
    setFilters: (filters: BulkFilters) => void;
    patchFilters: (patch: Partial<BulkFilters>) => void;
    clearFilters: () => void;
    sort: BulkSort;
    setSort: (sort: BulkSort) => void;
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

    filters: DEFAULT_FILTERS,
    setFilters: (filters) => set({ filters }),
    patchFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
    clearFilters: () => set({ filters: DEFAULT_FILTERS }),
    sort: DEFAULT_SORT,
    setSort: (sort) => set({ sort }),
}));

export default useBulkStore;
