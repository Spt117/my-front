import { create } from "zustand";
import { ShopifyCollection } from "./utils";

interface StoreState {
    collections: ShopifyCollection[];
    setCollections: (collections: ShopifyCollection[]) => void;
    filteredCollections: ShopifyCollection[];
    setFilteredCollections: (collections: ShopifyCollection[]) => void;
}

const useCollectionStore = create<StoreState>((set) => ({
    collections: [],
    setCollections: (collections) => set({ collections }),
    filteredCollections: [],
    setFilteredCollections: (collections) => set({ filteredCollections: collections }),
}));

export default useCollectionStore;
