"use client";
import { TVariant } from "@/library/models/produits/Variant";
import useVariantStore from "./store";
import { useEffect } from "react";
import { Variant } from "./Variant";
import ToggleMode from "./ToggleMode";

export default function mappingVariants({ data }: { data: TVariant[] }) {
    const { variantsBuy, setVariantsBuy, setVariantsBuyLater, mode, variantsBuyLater } = useVariantStore();

    useEffect(() => {
        const variantsBuy = data.filter((variant) => variant.rebuy === true);
        const variantsBuyLater = data.filter((variant) => variant.rebuyLater === true);
        setVariantsBuy(variantsBuy);
        setVariantsBuyLater(variantsBuyLater);
    }, [data, setVariantsBuy, setVariantsBuyLater]);

    return (
        <div className="w-full relative pt-10 pl-5 pr-5 flex gap-4 flex-wrap">
            <ToggleMode />
            {mode === "now" && variantsBuy.map((variant, index) => <Variant key={index} variant={variant} />)}
            {mode === "later" && variantsBuyLater.map((variant, index) => <Variant key={index} variant={variant} />)}
        </div>
    );
}
