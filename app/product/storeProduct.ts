import { TDomainsShopify } from "@/params/paramsShopify";
import { ProductStatus } from "@/library/types/graph";
import { create } from "zustand";
import { TCanal } from "./util";

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
    metaDescription: string;
    setMetaDescription: (description: string) => void;
    metaTitle: string;
    setMetaTitle: (title: string) => void;
    ancreUrl: string;
    setAncreUrl: (url: string) => void;
    redirectionUrl: boolean;
    setRedirectionUrl: (redirection: boolean) => void;
    statut: ProductStatus;
    setStatut: (statut: ProductStatus) => void;
    canauxProduct: TCanal[];
    setCanauxProduct: (canaux: TCanal[]) => void;
    idsOtherShop: { domain: TDomainsShopify; variantId: string; productId: string }[];
    setIdsOtherShop: (ids: { domain: TDomainsShopify; variantId: string; productId: string }[]) => void;
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
    canauxProduct: [],
    setCanauxProduct: (canauxProduct) => set({ canauxProduct }),
    metaDescription: "",
    setMetaDescription: (metaDescription) => set({ metaDescription }),
    metaTitle: "",
    setMetaTitle: (metaTitle) => set({ metaTitle }),
    ancreUrl: "",
    setAncreUrl: (ancreUrl) => set({ ancreUrl }),
    redirectionUrl: false,
    setRedirectionUrl: (redirectionUrl) => set({ redirectionUrl }),
    idsOtherShop: [],
    setIdsOtherShop: (idsOtherShop) => set({ idsOtherShop }),
}));

export default useProductStore;
