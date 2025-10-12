"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import ProductBulk from "./ProductBulk";
import { useEffect } from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useBulkStore from "./storeBulk";

export default function Page() {
    const { productsSearch, searchTerm, setSearchTerm, setProductsSearch, shopifyBoutique } = useShopifyStore();
    const { setSelectedProducts, selectedProducts } = useBulkStore();

    useEffect(() => {
        setProductsSearch([]);
        setSearchTerm("");
    }, [shopifyBoutique]);

    if (productsSearch.length === 0 && !searchTerm) return null;

    console.log(productsSearch[0]);

    const onSelectAll = () => {
        if (selectedProducts.length === productsSearch.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(productsSearch);
        }
    };

    return (
        <div className="relative">
            <CardHeader className="p-3 m-0 flex sticky top-10 bg-white z-10 border-b-1">
                <h2 className="text-lg font-semibold">Résultats de la recherche ({productsSearch.length})</h2>
                <Button variant="outline" size="sm" className="ml-auto" onClick={onSelectAll}>
                    {selectedProducts.length === productsSearch.length ? "Désélectionner tout" : "Tout sélectionner"}
                </Button>
            </CardHeader>
            <div className="p-4 relative space-y-2">
                {productsSearch.map((product, index) => (
                    <ProductBulk product={product} key={index} />
                ))}
            </div>
        </div>
    );
}
