"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { boutiqueFromId, TLocationHome } from "@/params/paramsShopify";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { setShopifyBoutique } = useShopifyStore();
    const router = useRouter();
    const param = useParams();

    useEventListener("orders/paid", (data: any) => {
        router.refresh();
    });

    useEffect(() => {
        const shopIdString = Array.isArray(param.shopId) ? param.shopId[0] : param.shopId;
        if (!shopIdString) return;
        const idShop = Number(shopIdString) as TLocationHome;
        const shop = boutiqueFromId(idShop);
        setShopifyBoutique(shop);
    }, [param]);

    return <>{children}</>;
}
