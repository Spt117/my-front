"use client";

import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import useProductStore from "@/app/shopify/[shopId]/products/[productId]/storeProduct";
import useOrdersStore from "@/components/shopify/orders/store";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { usePathname, useRouter } from "next/navigation";

export default function ShortCutProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { setSearchTerm, canauxBoutique, product, setShopifyBoutique } = useShopifyStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const { setPrice, setCanauxProduct, setCompareAtPrice } = useProductStore();
    const { setFilteredCollections, collections, setCanauxCollection, dataCollection } = useCollectionStore();

    const router = useRouter();
    const pathname = usePathname();

    const handleEscape = () => {
        setSearchTerm("");
        if (pathname.includes("collections")) {
            setFilteredCollections(collections);
            const canauxActives = canauxBoutique.map((c) => {
                const found = dataCollection?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
                if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
                else return { id: c.id, isPublished: false, name: c.name };
            });
            setCanauxCollection(canauxActives);
        }
        if (pathname.includes("products")) {
            const canauxActives = canauxBoutique.map((c) => {
                const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
                if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
                else return { id: c.id, isPublished: false, name: c.name };
            });
            setCanauxProduct(canauxActives);
            setPrice(product?.variants?.nodes[0].price ?? "0");
            setCompareAtPrice(product?.variants?.nodes[0].compareAtPrice || "0");
        }
        if (pathname.includes("orders")) {
            setShopifyBoutique(null);
            setFilterOrders(orders);
            router.push(`/shopify/orders`);
        }
    };

    useKeyboardShortcuts("Escape", handleEscape);

    return <>{children}</>;
}
