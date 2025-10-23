"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { useParams } from "next/navigation";
import { useEffect } from "react";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    const { shopifyBoutique } = useShopifyStore();
    const params = useParams();
    const productId = params.productId as string;
    const { getProductData, fetchTasks, fetchVariantData } = useDataProduct();

    useEffect(() => {
        fetchTasks();
        getProductData();
        fetchVariantData();
    }, [shopifyBoutique, productId]);

    return <>{children}</>;
}
