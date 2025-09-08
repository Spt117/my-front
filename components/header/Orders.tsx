"use client";
import useOrdersStore from "@/app/orders/store";
import { X } from "lucide-react";
import useShopifyStore from "../shopify/shopifyStore";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

export default function Orders() {
    const { orders, setFilterOrders, filterOrders, mode, setMode } = useOrdersStore();
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();

    const handleCleanShop = () => {
        setShopifyBoutique(null);
        setFilterOrders(orders);
    };

    return (
        <>
            <Selecteur />
            {(shopifyBoutique || orders.length > filterOrders.length) && (
                <button type="button" onClick={handleCleanShop} className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Effacer la recherche">
                    <X size={16} />
                </button>
            )}
        </>
    );
}

export function Selecteur() {
    const { orders, setFilterOrders, filterOrders, mode, setMode } = useOrdersStore();

    const toggleMode = () => {
        setMode(mode === "orders" ? "products" : "orders");
    };

    return (
        <div onClick={toggleMode} className="group cursor-pointer flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Switch checked={mode === "orders"} className="" />
            </div>
            <div className="relative flex items-center gap-2">
                <label className="cursor-pointer text-sm font-medium text-gray-700">{mode === "orders" ? "Commandes" : "Produits"}</label>
            </div>
        </div>
    );
}
