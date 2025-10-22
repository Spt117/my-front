"use client";

import { TCanal } from "@/app/product/util";
import MySpinner from "@/components/layout/my-spinner";
import useOrdersStore from "@/components/shopify/orders/store";
import { CanauxPublication, getDataBoutique } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useUserStore from "@/library/stores/storeUser";
import { boutiqueFromId } from "@/params/paramsShopify";
import { useParams } from "next/navigation";
import { useEffect } from "react";

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

    useEffect(() => {
        if (shopifyBoutique) {
            const filtered = orders.filter((domain) => domain.shop === shopifyBoutique.domain);
            setFilterOrders(filtered);
        } else {
            setFilterOrders(orders);
        }
    }, [shopifyBoutique, orders, setFilterOrders]);

    useEffect(() => {
        if (boutique) setShopifyBoutique(boutique);
    }, [shopId]);

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

    return <>{children}</>;
}
