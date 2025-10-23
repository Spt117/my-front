"use client";

import useOrdersStore from "@/components/shopify/orders/store";
import { CanauxPublication, getDataBoutique } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useUserStore from "@/library/stores/storeUser";
import { boutiqueFromId } from "@/params/paramsShopify";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { TCanal } from "./products/[productId]/util";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { ShopifyCollection } from "./collections/utils";
import useCollectionStore from "./collections/storeCollections";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    const { shopifyBoutique, setShopifyBoutique, setCanauxBoutique, setLoading } = useShopifyStore();
    const params = useParams();
    const { socket } = useUserStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const shopId = params.shopId as string;
    const boutique = boutiqueFromId(Number(params.shopId));
    const { setFilteredCollections, setCollections, setLoadingCollection, cleanCollections } = useCollectionStore();

    // ✅ PREMIER : Nettoyer dès que shopId change (avant tout le reste)
    useEffect(() => {
        cleanCollections();
        if (boutique) setShopifyBoutique(boutique);
    }, [shopId]);

    useEffect(() => {
        if (shopifyBoutique) {
            const filtered = orders.filter((domain) => domain.shop === shopifyBoutique.domain);
            setFilterOrders(filtered);
        } else {
            setFilterOrders(orders);
        }
    }, [shopifyBoutique, orders, setFilterOrders]);

    useEffect(() => {
        if (!socket) return;
        const handleShopChanged = () => {
            socket.on("shopChanged", (data) => {
                console.log(`${data.tagsCount} tags chargés pour ${data.shop}`);
            });
        };
        handleShopChanged();
        return () => {
            socket.off("shopChanged");
        };
    }, [socket]);

    useEffect(() => {
        const fetchCanaux = async () => {
            if (!shopifyBoutique) return;
            setLoading(true);
            socket?.emit("changeShop", shopifyBoutique.domain);
            try {
                const data = await getDataBoutique(shopifyBoutique.domain, "salesChannels");
                const canauxPublication = data.response as CanauxPublication[];
                const canauxProduits: TCanal[] = canauxPublication.map((c) => {
                    return { ...c, isPublished: false };
                });
                setCanauxBoutique(canauxProduits);
            } catch (error) {
                console.error("Error fetching boutique data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCanaux();
    }, [shopifyBoutique, socket]);

    // ✅ DEUXIEME : Charger les nouvelles collections
    useEffect(() => {
        const fetchCollections = async () => {
            if (!shopifyBoutique) return;
            try {
                setLoadingCollection(true);
                const collectionsData = (await getDataBoutique(shopifyBoutique.domain, "collections")) as ResponseServer<
                    ShopifyCollection[]
                >;
                setCollections(collectionsData.response || []);
                setFilteredCollections(collectionsData.response || []);
            } catch (error) {
                console.error("Error fetching collections:", error);
            } finally {
                setLoadingCollection(false);
            }
        };
        fetchCollections();
    }, [shopifyBoutique]);

    return <>{children}</>;
}
