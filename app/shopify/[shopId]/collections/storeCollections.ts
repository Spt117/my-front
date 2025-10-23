import { create } from "zustand";
import { ShopifyCollection, ShopifyCollectionWithProducts } from "./utils";

interface StoreState {
    collections: ShopifyCollection[];
    setCollections: (collections: ShopifyCollection[]) => void;
    filteredCollections: ShopifyCollection[];
    setFilteredCollections: (collections: ShopifyCollection[]) => void;
    dataCollection: ShopifyCollectionWithProducts | null;
    setDataCollection: (collection: ShopifyCollectionWithProducts | null) => void;
}

const useCollectionStore = create<StoreState>((set) => ({
    collections: [],
    setCollections: (collections) => set({ collections }),
    filteredCollections: [],
    setFilteredCollections: (collections) => set({ filteredCollections: collections }),
    dataCollection: null,
    setDataCollection: (collection) => set({ dataCollection: collection }),
}));

export default useCollectionStore;
