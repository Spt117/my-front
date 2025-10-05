import { ProductStatus } from "@/library/types/graph";
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
    statut: ProductStatus;
    setStatut: (statut: ProductStatus) => void;
    canaux: { id: string; name: string }[];
    setCanaux: (canaux: { id: string; name: string }[]) => void;
    canauxProduct: { publication: { id: string; name: string }; isPublished: boolean }[];
    setCanauxProduct: (canaux: { publication: { id: string; name: string }; isPublished: boolean }[]) => void;
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
    statut: "DRAFT",
    setStatut: (statut) => set({ statut }),
    canaux: [],
    setCanaux: (canaux) => set({ canaux }),
    canauxProduct: [],
    setCanauxProduct: (canauxProduct) => set({ canauxProduct }),
    activeCanalById: (id: string, isActive: boolean) =>
        set((state) => ({
            canauxProduct: state.canauxProduct.map((canal) =>
                canal.publication.id === id ? { ...canal, isPublished: isActive } : canal
            ),
        })),
}));

export default useProductStore;
