"use client";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { getStockVariant } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import { sleep } from "@/library/utils/helpers";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import useVariantStore from "./store";
import ToggleMode from "./ToggleMode";
import { Variant } from "./Variant";
import { toast } from "sonner";

export default function mappingVariants({ data }: { data: TVariant[] }) {
    const { variantsBuy, setVariantsBuy, setVariantsBuyLater, mode, variantsBuyLater } = useVariantStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleStoreVariants = (data: TVariant[]) => {
        const variantsBuy = data.filter((variant) => variant.rebuy === true);
        const variantsBuyLater = data.filter((variant) => variant.rebuyLater === true);
        setVariantsBuy(variantsBuy);
        setVariantsBuyLater(variantsBuyLater);
    };
    const getData = async () => {
        setIsLoading(true);
        await sleep(1500);
        try {
            const dataUpdated = await getStockVariant();
            handleStoreVariants(dataUpdated);
        } catch (error) {
            console.error("Erreur lors de la récupération des données mises à jour:", error);
            toast.error("Erreur lors de la récupération des données mises à jour");
        } finally {
            setIsLoading(false);
        }
    };

    useEventListener("inventory_levels/update", () => getData());

    useEffect(() => {
        handleStoreVariants(data);
    }, [data, setVariantsBuy, setVariantsBuyLater]);

    return (
        <div className="w-full relative pl-5 pr-5 flex gap-4 flex-wrap">
            <div className="w-full flex items-center gap-2 mt-3">
                <ToggleMode />
                {isLoading && <RefreshCcw className={`transition-transform duration-300 ease-in-out animate-spin`} />}
            </div>
            {mode === "now" && variantsBuy.map((variant, index) => <Variant key={index} variant={variant} />)}
            {mode === "later" && variantsBuyLater.map((variant, index) => <Variant key={index} variant={variant} />)}
        </div>
    );
}
