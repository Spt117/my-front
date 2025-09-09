import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { useEffect } from "react";
import Order from "./Order";
import useOrdersStore from "./store";
import { ShopifyOrder } from "@/library/shopify/orders";

export default function MappingOrders({ ordersDomains }: { ordersDomains: ShopifyOrder[] }) {
    const { setOrders, setFilterOrders, filterOrders, mode } = useOrdersStore();
    const { shopifyBoutique, setShopifyBoutique, setSearchTerm } = useShopifyStore();

    const handleEscape = () => {
        setShopifyBoutique(null);
        setFilterOrders(ordersDomains);
        setSearchTerm("");
    };
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
    return (
        <>
            <h1 className="text-2xl font-bold m-3">{filterOrders.length} commandes</h1>
            {filterOrders.map((order) => (
                <Order key={order.name} order={order} />
            ))}
        </>
    );
}
