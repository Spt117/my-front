import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { useEffect } from "react";
import Order from "./Order";
import useOrdersStore from "./store";
import { GroupedShopifyOrder, ShopifyOrder } from "@/library/shopify/orders";
import { boutiques } from "@/library/params/paramsShopify";

export default function MappingOrders({ ordersDomains }: { ordersDomains: GroupedShopifyOrder[] }) {
    const { setOrders, setFilterOrders, filterOrders, mode } = useOrdersStore();
    const { shopifyBoutique, setShopifyBoutique, setSearchTerm } = useShopifyStore();

    const handleEscape = () => {
        setShopifyBoutique(boutiques[0]);
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
            {filterOrders.map((order, index) => (
                <Order key={index} orderData={{ response: order }} />
            ))}
        </>
    );
}
