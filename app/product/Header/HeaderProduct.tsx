"use client";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Tag } from "lucide-react";
import ActionsHeader from "./ActionsHeader";
import useShopifyStore from "@/components/shopify/shopifyStore";
import Image from "next/image";
import OtherShop from "../OtherShop";

export default function HeaderProduct() {
    const { handleCopy } = useCopy();
    const { product, shopifyBoutique } = useShopifyStore();

    if (!product || !shopifyBoutique) return null;

    return (
        <CardHeader className="sticky top-12 w-full z-10     bg-gray-50 ">
            <div className="flex items-center justify-between gap-3">
                <CardTitle
                    onClick={() => {
                        handleCopy(product.title);
                    }}
                    className="flex flex-shrink-0 items-center gap-2 text-lg font-semibold cursor-pointer transition-transform duration-500 ease-out active:scale-85"
                    title="Cliquer pour copier le titre"
                >
                    <Tag size={20} className={`text-gray-500`} />
                    {product.title}
                </CardTitle>
                <OtherShop />
                <ActionsHeader />{" "}
            </div>
        </CardHeader>
    );
}
