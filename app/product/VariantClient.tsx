"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { VariantStock } from "../stock/VariantStock";
import { getVariantBySku } from "@/library/models/produits/middlewareVariants";

export default function VariantClient() {
    const { variant, setVariant } = useShopifyStore();

    if (!variant) return;

    const actionStoreVariant = async () => {
        if (!variant) return;
        const variantUpdated = await getVariantBySku(variant.sku);
        if (variantUpdated) setVariant(variantUpdated);
    };

    return <VariantStock variant={variant} action={actionStoreVariant} />;
}
