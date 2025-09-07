import { IOrdersDomains } from "@/library/shopify/orders";
import { create } from "zustand";

interface StoreState {
    orders: IOrdersDomains[];
    setOrders: (orders: IOrdersDomains[]) => void;
    filterOrders: IOrdersDomains[];
    setFilterOrders: (orders: IOrdersDomains[]) => void;
}

const useOrdersStore = create<StoreState>((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    filterOrders: [],
    setFilterOrders: (orders) => set({ filterOrders: orders }),
}));

export default useOrdersStore;
