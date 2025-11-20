"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { getStockVariant } from "@/library/models/variantShopify/middlewareVariants";
import { TVariant } from "@/library/models/variantShopify/Variant";
import { sleep } from "@/library/utils/helpers";
import { useEffect } from "react";
import { toast } from "sonner";
import useVariantStore from "./store";
import { VariantStock } from "./VariantStock";

export default function mappingVariants({ data }: { data: TVariant[] }) {
    const { variants, setVariants, setVariantsFilter, mode, variantsFilter, setLoading } = useVariantStore();
    const { searchTerm } = useShopifyStore();

    const handleStoreVariants = (dataVariants: TVariant[]) => {
        if (mode === "now") {
            const variantsBuy = dataVariants.filter((variant) => variant.rebuy === true);
            setVariantsFilter(variantsBuy);
        }
        if (mode === "later") {
            const variantsBuyLater = dataVariants.filter((variant) => variant.rebuyLater === true);
            setVariantsFilter(variantsBuyLater);
        }
        if (mode === "bought") {
            const variantsBought = dataVariants.filter((variant) => variant.bought === true);
            setVariantsFilter(variantsBought);
        }
    };
    const domain = "bayblade-shops.myshopify.com";
    const getData = async () => {
        setLoading(true);
        try {
            const dataUpdated = await getStockVariant(domain);
            setVariants(dataUpdated);
            await sleep(500); // Pour voir l'animation de chargement
        } catch (error) {
            console.error("Erreur lors de la récupération des données mises à jour:", error);
            toast.error("Erreur lors de la récupération des données mises à jour");
        } finally {
            setLoading(false);
        }
    };

    useEventListener("products/update", () => getData());

    useEffect(() => {
        setVariants(data);
    }, [data]);

    useEffect(() => {
        if (!searchTerm) handleStoreVariants(variants);
        else {
            const skus = new Set(variantsFilter.map((v) => v.sku));
            const v = variants.filter((variant) => skus.has(variant.sku));
            setVariantsFilter(v);
        }
    }, [mode, variants]);

    useEffect(() => {
        if (!searchTerm) {
            handleStoreVariants(variants);
        }
    }, [searchTerm]);

    return (
        <div className="w-full relative pl-5 pr-5 flex gap-4 flex-wrap mt-2">
            {variantsFilter.map((variant, index) => (
                <VariantStock key={index} variant={variant} action={getData} domain={domain} />
            ))}
        </div>
    );
}
