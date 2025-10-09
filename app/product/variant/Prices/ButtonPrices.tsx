"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import useProductStore from "../../storeProduct";
import useTaskStore from "../../Tasks/storeTasks";
import usePrices from "./hooksPrices";

export default function ButtonPrices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { param } = useTaskStore();
    const { setPrice, setCompareAtPrice, setIsUpdatingPrice, price, compareAtPrice, isUpdatingPrice, isChanged } =
        useProductStore();
    const actionsPrices = usePrices();

    useEffect(() => {
        setPrice(product?.variants.nodes[0].price || "0");
        setCompareAtPrice(product?.variants.nodes[0].compareAtPrice || "0");
    }, [product?.variants.nodes[0].price, product?.variants.nodes[0].compareAtPrice]);

    if (!product || !shopifyBoutique) return null;
    const mainVariant = product.variants.nodes[0];

    const handleUpdatePrice = async () => {
        setIsUpdatingPrice(true);
        if (param > 0) await actionsPrices?.addTaskStopPromotion();
        if (Number(price) !== Number(mainVariant.price)) await actionsPrices?.handleUpdatePrices("price", Number(price));
        if (Number(compareAtPrice) !== Number(mainVariant.compareAtPrice || "0"))
            await actionsPrices?.handleUpdatePrices("compareAtPrice", Number(compareAtPrice));
        setIsUpdatingPrice(false);
    };

    useKeyboardShortcuts("Enter", () => {
        if ((isChanged || param) && !isUpdatingPrice) handleUpdatePrice();
    });

    return (
        <Button
            disabled={!isChanged && !param}
            onClick={handleUpdatePrice}
            className="bg-emerald-600 enable:hover:bg-emerald-700 disabled:bg-slate-300 min-w-[150px]"
        >
            {isUpdatingPrice ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Mise à jour...</span>
                </div>
            ) : isChanged || param ? (
                <div className="flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Mettre à jour</span>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <X className="h-4 w-4" />
                    <span className="text-xs">À jour</span>
                </div>
            )}
        </Button>
    );
}
