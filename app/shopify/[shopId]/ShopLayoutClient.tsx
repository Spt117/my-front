"use client";

import { useEffect } from "react";
import useOrdersStore from "@/components/shopify/orders/store";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useUserStore from "@/library/stores/storeUser";
import useCollectionStore from "./collections/storeCollections";
import { CanauxPublication } from "@/components/shopify/serverActions";
import { ShopifyCollection } from "./collections/utils";
import { TCanal } from "./products/[productId]/util";

interface ShopLayoutClientProps {
    children: React.ReactNode;
    boutique: any;
    canauxPublication: CanauxPublication[];
    collections: ShopifyCollection[];
    shopId: string;
}

export default function ShopLayoutClient({ children, boutique, canauxPublication, collections, shopId }: ShopLayoutClientProps) {
    const { setShopifyBoutique, setCanauxBoutique } = useShopifyStore();
    const { socket } = useUserStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const { setFilteredCollections, setCollections } = useCollectionStore();

    // Initialisation avec les données serveur
    useEffect(() => {
        if (boutique) {
            setShopifyBoutique(boutique);
            // Transformer les canaux
            const canauxProduits: TCanal[] = canauxPublication.map((c) => ({
                ...c,
                isPublished: false,
            }));
            setCanauxBoutique(canauxProduits);

            // Définir les collections
            setCollections(collections);
            setFilteredCollections(collections);
        }
    }, [shopId, collections, canauxPublication]);

    // Filtrage des orders
    useEffect(() => {
        if (boutique) {
            const filtered = orders.filter((order) => order.shop === boutique.domain);
            setFilterOrders(filtered);
        } else {
            setFilterOrders(orders);
        }
    }, [boutique, orders]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !boutique) return;

        socket.emit("changeShop", boutique.domain);

        const handleShopChanged = (data: any) => {
            console.log(`${data.tagsCount} tags chargés pour ${data.shop}`);
        };

        socket.on("shopChanged", handleShopChanged);

        return () => {
            socket.off("shopChanged", handleShopChanged);
        };
    }, [socket, boutique]);

    return <>{children}</>;
}
