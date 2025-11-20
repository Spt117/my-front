import { create } from "zustand";
import { TCanal } from "../products/[productId]/util";
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

    // States of collection details
    loadingSave: boolean;
    setLoadingSave: (loading: boolean) => void;
    collectionTitle: string;
    setCollectionTitle: (title: string) => void;
    collectionDescription: string;
    setCollectionDescription: (description: string) => void;
    ancreUrl: string;
    setAncreUrl: (ancreUrl: string) => void;
    metaTitle: string;
    setMetaTitle: (metaTitle: string) => void;
    metaDescription: string;
    setMetaDescription: (metaDescription: string) => void;
    canauxCollection: TCanal[];
    setCanauxCollection: (canaux: TCanal[]) => void;
    redirectionUrl: boolean;
    setRedirectionUrl: (redirectionUrl: boolean) => void;
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
    collectionTitle: "",
    setCollectionTitle: (title) => set({ collectionTitle: title }),
    collectionDescription: "",
    setCollectionDescription: (description) => set({ collectionDescription: description }),
    ancreUrl: "",
    setAncreUrl: (ancreUrl) => set({ ancreUrl }),
    metaTitle: "",
    setMetaTitle: (metaTitle) => set({ metaTitle }),
    metaDescription: "",
    setMetaDescription: (metaDescription) => set({ metaDescription }),
    canauxCollection: [],
    setCanauxCollection: (canaux) => set({ canauxCollection: canaux }),
    loadingSave: false,
    setLoadingSave: (loading) => set({ loadingSave: loading }),
    redirectionUrl: false,
    setRedirectionUrl: (redirectionUrl) => set({ redirectionUrl }),
}));

export default useCollectionStore;
