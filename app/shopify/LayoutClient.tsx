"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { IShopifyBase } from "@/params/paramsShopifyTypes";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

interface LayoutClientProps {
    children: React.ReactNode;
    allBoutiques: IShopifyBase[];
}

export default function ShopifyLayoutClient({ children, allBoutiques }: LayoutClientProps) {
    const { setShopifyBoutique, setAllBoutiques } = useShopifyStore();
    const router = useRouter();
    const param = useParams();

    useEventListener("orders/paid", (_data: any) => {
        router.refresh();
    });

    useEffect(() => {
        setAllBoutiques(allBoutiques);
    }, [allBoutiques]);

    useEffect(() => {
        const shopIdString = Array.isArray(param.shopId) ? param.shopId[0] : param.shopId;
        if (!shopIdString) return;
        const boutique = allBoutiques.find((b) => b.id === Number(shopIdString));
        if (boutique) setShopifyBoutique(boutique);
    }, [param, allBoutiques]);

    return <>{children}</>;
}
