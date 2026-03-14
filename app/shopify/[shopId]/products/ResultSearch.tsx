"use client";
import ProductList from "@/components/header/products/Products";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Package } from "lucide-react";

import { toast } from "sonner";
import { useEffect } from "react";

interface ResultSearchProps {
    products: any[];
    error?: string | null;
    totalProducts?: number | null;
    boutiqueName: string;
}

export default function ResultSearch({ products, error, totalProducts, boutiqueName }: ResultSearchProps) {
    const { productsSearch } = useShopifyStore();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const displayedProducts = (productsSearch.length > 0 ? productsSearch : products)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Catalogue produits</h2>
                        <p className="text-sm text-muted-foreground">{boutiqueName}</p>
                    </div>
                </div>
                {totalProducts !== null && totalProducts !== undefined && (
                    <Badge variant="secondary" className="text-sm">
                        {totalProducts.toLocaleString("fr-FR")} produits
                    </Badge>
                )}
            </div>
            <Separator className="mb-4" />
            {displayedProducts.map((product, index) => (
                <ProductList product={product} key={index} />
            ))}
        </div>
    );
}
