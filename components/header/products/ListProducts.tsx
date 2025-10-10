"use client";
import { Separator } from "@/components/ui/separator";
import useShopifyStore from "../../shopify/shopifyStore";
import ProductList from "./Products";
import Image from "next/image";

export default function ListProducts() {
    const { productsSearch, searchTerm, loading } = useShopifyStore();

    if (productsSearch.length === 0 && !searchTerm) return null;

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {productsSearch.map((product, index) => (
                <ProductList products={product} key={index} />
            ))}
            <Separator />
        </div>
    );
}
