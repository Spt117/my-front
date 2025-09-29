"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { getStockVariant } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useVariantStore from "./store";
import { VariantStock } from "./VariantStock";

export default function mappingVariants({ data }: { data: TVariant[] }) {
    const { variants, setVariants, setVariantsFilter, mode, variantsFilter } = useVariantStore();
    const { searchTerm } = useShopifyStore();

    const [isLoading, setIsLoading] = useState(false);

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

    const getData = async () => {
        setIsLoading(true);
        try {
            const dataUpdated = await getStockVariant();
            setVariants(dataUpdated);
        } catch (error) {
            console.error("Erreur lors de la récupération des données mises à jour:", error);
            toast.error("Erreur lors de la récupération des données mises à jour");
        } finally {
            setIsLoading(false);
        }
    };

    useEventListener("products/update", () => getData());

    useEffect(() => {
        setVariants(data);
    }, [data]);

    useEffect(() => {
        handleStoreVariants(variants);
    }, [mode, variants]);

    useEffect(() => {
        if (!searchTerm) {
            handleStoreVariants(variants);
        }
    }, [searchTerm]);

    return (
        <div className="w-full relative pl-5 pr-5 flex gap-4 flex-wrap">
            <div className="w-full flex items-center gap-2 mt-3">
                {isLoading && <RefreshCcw size={20} className={`transition-transform duration-300 ease-in-out animate-spin`} />}
            </div>
            {variantsFilter.map((variant, index) => (
                <VariantStock key={index} variant={variant} action={getData} />
            ))}
        </div>
    );
}
