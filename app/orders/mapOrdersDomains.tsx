"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { IOrdersDomains } from "@/library/shopify/orders";
import { useEffect } from "react";
import OrdersList from "./list";
import useOrdersStore from "./store";

export default function MapOrdersDomains({ ordersDomains }: { ordersDomains: IOrdersDomains[] }) {
    const { setOrders, setFilterOrders, filterOrders, mode } = useOrdersStore();
    const { shopifyBoutique } = useShopifyStore();

    const handleEscape = () => setFilterOrders(ordersDomains);
    useKeyboardShortcuts("Escape", handleEscape);

    useEffect(() => {
        setOrders(ordersDomains);
        setFilterOrders(ordersDomains);
    }, [ordersDomains, setOrders, setFilterOrders]);

    useEffect(() => {
        if (shopifyBoutique) {
            const filtered = ordersDomains.filter((domain) => domain.shop === shopifyBoutique.domain);
            setFilterOrders(filtered);
        } else {
            setFilterOrders(ordersDomains);
        }
    }, [shopifyBoutique, ordersDomains, setFilterOrders]);

    if (mode !== "orders") return null;
    const countOrders = filterOrders.reduce((acc, domain) => acc + domain.orders.length, 0);
    return (
        <>
            <h1 className="text-2xl font-bold m-3">{countOrders} commandes</h1>
            {filterOrders.map((shop) => (
                <OrdersList key={shop.shop} data={shop} />
            ))}
        </>
    );
}
