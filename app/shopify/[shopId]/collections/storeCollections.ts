import { create } from "zustand";
import { ShopifyCollection, ShopifyCollectionWithProducts } from "./utils";

interface StoreState {
    collections: ShopifyCollection[];
    setCollections: (collections: ShopifyCollection[]) => void;
    filteredCollections: ShopifyCollection[];
    setFilteredCollections: (collections: ShopifyCollection[]) => void;
    cleanCollections: () => void;
    dataCollection: ShopifyCollectionWithProducts | null;
    setDataCollection: (collection: ShopifyCollectionWithProducts | null) => void;
    loadingCollection: boolean;
    setLoadingCollection: (loading: boolean) => void;
}

const useCollectionStore = create<StoreState>((set) => ({
    collections: [],
    setCollections: (collections) => set({ collections }),
    filteredCollections: [],
    setFilteredCollections: (collections) => set({ filteredCollections: collections }),
    dataCollection: null,
    setDataCollection: (dataCollection) => set({ dataCollection }),
    loadingCollection: false,
    setLoadingCollection: (loading) => set({ loadingCollection: loading }),
    cleanCollections: () => set({ collections: [], filteredCollections: [], dataCollection: null }),
}));

export default useCollectionStore;
