import { IOrdersDomains } from "@/library/shopify/orders";
import { create } from "zustand";

interface StoreState {
    orders: IOrdersDomains[];
    setOrders: (orders: IOrdersDomains[]) => void;
    filterOrders: IOrdersDomains[];
    setFilterOrders: (orders: IOrdersDomains[]) => void;
    mode: "orders" | "products";
    setMode: (mode: "orders" | "products") => void;
    products: ProductInOrder[];
    setProducts: (products: ProductInOrder[]) => void;
}

const useOrdersStore = create<StoreState>((set) => ({
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
