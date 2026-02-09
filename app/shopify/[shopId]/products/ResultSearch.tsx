"use client";
import ProductList from "@/components/header/products/Products";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Separator } from "@radix-ui/react-separator";

import { toast } from "sonner";
import { useEffect } from "react";

export default function ResultSearch({ products, error }: { products: any[]; error?: string | null }) {
    const { productsSearch } = useShopifyStore();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    if (productsSearch.length === 0)
        return (
            <div className="w-full">
                <h2>Liste des derniers produits</h2>
                {products.map((product, index) => (
                    <ProductList product={product} key={index} />
                ))}
                <Separator />
            </div>
        );
    return (
        <div className="w-full">
            {productsSearch.map((product, index) => (
                <ProductList product={product} key={index} />
            ))}
            <Separator />
        </div>
    );
}
