"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";
import { Tag } from "lucide-react";
import { useEffect, useRef } from "react";
import InputPrice from "./InputPrice";
import useProductStore from "../../storeProduct";

export default function PriceUpdate() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { price, setPrice, setIsChanged } = useProductStore();
    const ref = useRef<HTMLInputElement>(null);

    const mainVariant = product?.variants.nodes[0];
    const isPriceChanged = price !== mainVariant?.price;
    useEffect(() => {
        if (isPriceChanged) setIsChanged(true);
        else setIsChanged(false);
    }, [isPriceChanged]);

    if (!product || !shopifyBoutique) return null;

    return (
        <>
            <div className="flex items-center justify-between flex-wrap gap-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Prix de vente
                </Label>
                {isPriceChanged && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        Modifié
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <InputPrice ref={ref} price={price} action={setPrice} priceOrigin={product.variants.nodes[0].price} />
            </div>
        </>
    );
}
