import { GroupedShopifyOrder, ShopifyOrder } from "@/library/shopify/orders";
import { TDomainsShopify } from "@/params/paramsShopify";
import { create } from "zustand";

interface StoreState {
    ordersSearch: ShopifyOrder[];
    setOrdersSearch: (orders: ShopifyOrder[]) => void;
    orders: GroupedShopifyOrder[];
    setOrders: (orders: GroupedShopifyOrder[]) => void;
    // Store orders by shop domain
    ordersByShop: Record<TDomainsShopify, GroupedShopifyOrder[]>;
    setOrdersForShop: (shop: TDomainsShopify, orders: GroupedShopifyOrder[]) => void;
    getOrderCountByShop: (shop: TDomainsShopify) => number;
    filterOrders: GroupedShopifyOrder[];
    setFilterOrders: (orders: GroupedShopifyOrder[]) => void;
    mode: "orders" | "products";
    setMode: (mode: "orders" | "products") => void;
    products: ProductInOrder[];
    setProducts: (products: ProductInOrder[]) => void;
}

const useOrdersStore = create<StoreState>((set, get) => ({
    ordersSearch: [],
    setOrdersSearch: (orders) => set({ ordersSearch: orders }),
    orders: [],
    setOrders: (orders) => set({ orders }),
    // Orders by shop - preserves orders for all shops
    ordersByShop: {} as Record<TDomainsShopify, GroupedShopifyOrder[]>,
    setOrdersForShop: (shop, orders) => set((state) => ({
        ordersByShop: {
            ...state.ordersByShop,
            [shop]: orders,
        },
    })),
    getOrderCountByShop: (shop) => {
        const state = get();
        return state.ordersByShop[shop]?.length || 0;
    },
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
    fulfillmentStatus: "unfulfilled" | "fulfilled";
}

