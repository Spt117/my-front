import { TCanal } from '@/app/shopify/[shopId]/products/[productId]/util';
import { TVariant } from '@/library/models/variantShopify/Variant';
import { ShopifyCustomer } from '@/library/shopify/clients';
import { ShopifyOrder } from '@/library/shopify/orders';
import { ProductGET } from '@/library/types/graph';
import { TSearchMode } from '@/params/menu';
import { IShopify } from '@/params/paramsShopify';
import { create } from 'zustand';
import { TBrand, TProductType } from './ProductType';

interface StoreState {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    shopifyBoutique: IShopify | null;
    setShopifyBoutique: (boutique: IShopify | null) => void;
    productsSearch: ProductGET[];
    setProductsSearch: (products: ProductGET[]) => void;
    ordersSearch: ShopifyOrder[];
    setOrdersSearch: (orders: ShopifyOrder[]) => void;
    clientsSearch: ShopifyCustomer[];
    setClientsSearch: (clients: ShopifyCustomer[]) => void;
    product: ProductGET | null;
    setProduct: (product: ProductGET | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    selectedType: TProductType | null;
    setSelectedType: (type: TProductType | null) => void;
    selectedBrand: TBrand | null;
    setSelectedBrand: (brand: TBrand | null) => void;
    variant: TVariant | null;
    setVariant: (variant: TVariant | null) => void;
    mySpinner: boolean;
    setMySpinner: (loading: boolean) => void;
    dialogOpen: number;
    openDialog: (n: number) => void;
    closeDialog: () => void;
    canauxBoutique: TCanal[];
    setCanauxBoutique: (canaux: TCanal[]) => void;
    searchMode: TSearchMode;
    setSearchMode: (mode: TSearchMode) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
}

const useShopifyStore = create<StoreState>((set) => ({
    isSearchOpen: false,
    setIsSearchOpen: (open) => set({ isSearchOpen: open }),
    loading: false,

    setLoading: (loading) => set({ loading }),
    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
    shopifyBoutique: null,
    setShopifyBoutique: (boutique) => set({ shopifyBoutique: boutique }),
    productsSearch: [],
    setProductsSearch: (products) => set({ productsSearch: products }),
    ordersSearch: [],
    setOrdersSearch: (orders) => set({ ordersSearch: orders }),
    clientsSearch: [],
    setClientsSearch: (clients) => set({ clientsSearch: clients }),
    product: null,
    setProduct: (product) => set({ product }),
    selectedType: null,
    setSelectedType: (type) => set({ selectedType: type }),
    selectedBrand: null,
    setSelectedBrand: (brand) => set({ selectedBrand: brand }),
    variant: null,
    setVariant: (variant) => set({ variant }),
    mySpinner: false,
    setMySpinner: (loading) => set({ mySpinner: loading }),
    dialogOpen: 0,
    openDialog: (n: number) => set({ dialogOpen: n }),
    closeDialog: () => set({ dialogOpen: 0 }),
    canauxBoutique: [],
    setCanauxBoutique: (canauxBoutique) => set({ canauxBoutique }),
    searchMode: 'standard',
    setSearchMode: (mode) => set({ searchMode: mode }),
}));

export default useShopifyStore;
