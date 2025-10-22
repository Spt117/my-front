"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { boutiqueFromId } from "@/params/paramsShopify";
import { useParams } from "next/navigation";
import { useEffect } from "react";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    const params = useParams();
    const shopId = params.shopId as string;

    const boutique = boutiqueFromId(Number(shopId));
    const { setShopifyBoutique } = useShopifyStore();

    useEffect(() => {
        console.log("Setting shopify boutique for shopId:", shopId);

        if (boutique) {
            setShopifyBoutique(boutique);
        }
    }, [shopId]);

    return <>{children}</>;
}
