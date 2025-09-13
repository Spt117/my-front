import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiques } from "@/library/params/paramsShopify";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import { useEffect } from "react";
import Order from "./Order";
import useOrdersStore from "./store";

export default function MappingOrders({ orders }: { orders: GroupedShopifyOrder[] }) {
    const { setOrders, setFilterOrders, filterOrders, mode } = useOrdersStore();
    const { shopifyBoutique, setShopifyBoutique, setSearchTerm } = useShopifyStore();

    const handleEscape = () => {
        setShopifyBoutique(null);
        setFilterOrders(orders);
        setSearchTerm("");
    };
    useKeyboardShortcuts("Escape", handleEscape);

    useEffect(() => {
        setOrders(orders);
        setFilterOrders(orders);
    }, [orders, setOrders, setFilterOrders]);

    useEffect(() => {
        if (shopifyBoutique) {
            const filtered = orders.filter((domain) => domain.shop === shopifyBoutique.domain);
            setFilterOrders(filtered);
        } else {
            setFilterOrders(orders);
        }
    }, [shopifyBoutique, orders, setFilterOrders]);

    if (mode !== "orders") return null;
    return (
        <>
            <h1 className="text-2xl font-bold m-3">{filterOrders.length} commandes</h1>
            {filterOrders.map((order, index) => (
                <Order key={index} order={order} />
            ))}
        </>
    );
}
