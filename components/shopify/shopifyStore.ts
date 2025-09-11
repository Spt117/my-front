import { boutiques, IShopify } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { IShopifyProductSearch } from "@/library/types/shopifySearch";
import { create } from "zustand";
import { TBrand, TProductType } from "./ProductType";

interface StoreState {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    shopifyBoutique: IShopify | null;
    setShopifyBoutique: (boutique: IShopify | null) => void;
    productsSearch: IShopifyProductSearch[];
    setProductsSearch: (products: IShopifyProductSearch[]) => void;
    product: ProductGET | null;
    setProduct: (product: ProductGET | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    selectedType: TProductType | null;
    setSelectedType: (type: TProductType | null) => void;
    selectedBrand: TBrand | null;
    setSelectedBrand: (brand: TBrand | null) => void;
    event: string | null;
    setEvent: (event: string | null) => void;
}

const useShopifyStore = create<StoreState>((set) => ({
    event: null,
    setEvent: (event) => set({ event }),
    loading: false,
    setLoading: (loading) => set({ loading }),
    searchTerm: "",
    setSearchTerm: (term) => set({ searchTerm: term }),
    shopifyBoutique: boutiques[1],
    setShopifyBoutique: (boutique) => set({ shopifyBoutique: boutique }),
    productsSearch: [],
    setProductsSearch: (products) => set({ productsSearch: products }),
    product: null,
    setProduct: (product) => set({ product }),
    selectedType: null,
    setSelectedType: (type) => set({ selectedType: type }),
    selectedBrand: null,
    setSelectedBrand: (brand) => set({ selectedBrand: brand }),
}));

export default useShopifyStore;
