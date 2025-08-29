"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { boutiques } from "@/library/params/paramsShopify";
import { useEffect } from "react";
import Product from "../../app/[shopify]/Product";

export default function ClientProduct() {
    const { product, setShopifyBoutique, shopifyBoutique } = useShopifyStore();

    useEffect(() => {
        if (!shopifyBoutique) setShopifyBoutique(boutiques[1]);
    }, []);

    if (product && shopifyBoutique) return <Product data={product} boutique={shopifyBoutique} />;
}
