import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import { RefObject, useEffect } from "react";

export default function InputPrice({
    ref,
    price,
    priceOrigin,
    action,
}: {
    ref: RefObject<HTMLInputElement | null>;
    price: string;
    priceOrigin: string;
    action: (price: string) => void;
}) {
    const { product, shopifyBoutique } = useShopifyStore();

    useEffect(() => {
        if (price === priceOrigin && ref.current) {
            ref.current.value = "";
        }
    }, [price]);

    if (!product || !shopifyBoutique) return null;

    return (
        <div className="relative w-fit">
            <Input
                ref={ref}
                id="comparePrice"
                type="number"
                min={product.variants.nodes[0].price}
                placeholder={price}
                onChange={(e) => action(e.target.value)}
                className="pr-8 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <span className="absolute bottom-2 right-2 text-slate-500 text-sm font-medium">{shopifyBoutique.devise}</span>
        </div>
    );
}
