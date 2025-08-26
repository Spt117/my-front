import { IShopify } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { IShopifyProductSearch } from "@/library/types/shopifySearch";
import { create } from "zustand";

interface StoreState {
    shopifyBoutique: IShopify | null;
    setShopifyBoutique: (boutique: IShopify | null) => void;
    productsSearch: IShopifyProductSearch[];
    setProductsSearch: (products: IShopifyProductSearch[]) => void;
    product: ProductGET | null;
    setProduct: (product: ProductGET | null) => void;
}

const useShopifyStore = create<StoreState>((set) => ({
    shopifyBoutique: null,
    setShopifyBoutique: (boutique) => set({ shopifyBoutique: boutique }),
    productsSearch: [],
    setProductsSearch: (products) => set({ productsSearch: products }),
    product: null,
    setProduct: (product) => set({ product }),
}));

export default useShopifyStore;
