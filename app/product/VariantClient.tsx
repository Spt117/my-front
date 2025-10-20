"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { VariantStock } from "../stock/VariantStock";
import { getVariantBySku } from "@/library/models/variantShopify/middlewareVariants";

export default function VariantClient() {
    const { variant, setVariant, shopifyBoutique } = useShopifyStore();

    if (!variant || !shopifyBoutique) return;

    const actionStoreVariant = async () => {
        if (!variant) return;
        const variantUpdated = await getVariantBySku(shopifyBoutique.domain, variant.sku);
        console.log(variantUpdated);

        if (variantUpdated) setVariant(variantUpdated);
    };

    return <VariantStock domain={shopifyBoutique.domain} variant={variant} action={actionStoreVariant} />;
}
