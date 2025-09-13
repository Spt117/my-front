import { GroupedShopifyOrder, ShopifyOrder } from "@/library/shopify/orders";
import { create } from "zustand";

interface StoreState {
    ordersSearch: ShopifyOrder[];
    setOrdersSearch: (orders: ShopifyOrder[]) => void;
    orders: GroupedShopifyOrder[];
    setOrders: (orders: GroupedShopifyOrder[]) => void;
    filterOrders: GroupedShopifyOrder[];
    setFilterOrders: (orders: GroupedShopifyOrder[]) => void;
    mode: "orders" | "products";
    setMode: (mode: "orders" | "products") => void;
    products: ProductInOrder[];
    setProducts: (products: ProductInOrder[]) => void;
}

const useOrdersStore = create<StoreState>((set) => ({
    ordersSearch: [],
    setOrdersSearch: (orders) => set({ ordersSearch: orders }),
    orders: [],
    setOrders: (orders) => set({ orders }),
    filterOrders: [],
    setFilterOrders: (orders) => set({ filterOrders: orders }),
    mode: "orders",
    setMode: (mode) => set({ mode }),
    products: [],
    setProducts: (products) => set({ products }),
}));

export default useOrdersStore;

export interface ProductInOrder {
    title: string;
    image: string;
    productUrl: string;
    quantity: number;
    shop: string;
    sku: string;
}
