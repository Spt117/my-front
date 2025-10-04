"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";
import { Tag } from "lucide-react";
import { useEffect, useRef } from "react";
import InputPrice from "./InputPrice";
import useProductStore from "../../storeProduct";

export default function CompareAtPriceUpdate() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { compareAtPrice, price, setCompareAtPrice, setIsChanged } = useProductStore();
    const refCompare = useRef<HTMLInputElement>(null);

    const mainVariant = product?.variants.nodes[0];
    const isCompareAtPriceChanged = compareAtPrice !== (mainVariant?.compareAtPrice || "0");

    useEffect(() => {
        if (isCompareAtPriceChanged) setIsChanged(true);
        else setIsChanged(false);
    }, [isCompareAtPriceChanged]);

    if (!product || !shopifyBoutique) return null;

    const discount =
        compareAtPrice && price
            ? Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)
            : 0;
    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="comparePrice" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Prix barré
                    </Label>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <InputPrice
                        ref={refCompare}
                        price={compareAtPrice}
                        action={setCompareAtPrice}
                        priceOrigin={product.variants.nodes[0].compareAtPrice || "0"}
                    />
                    {discount > 0 && (
                        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                            -{discount}%
                        </Badge>
                    )}
                </div>
            </div>
        </>
    );
}
