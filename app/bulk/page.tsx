"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import ProductBulk from "./ProductBulk";

export default function Page() {
    const { productsSearch, searchTerm } = useShopifyStore();

    if (productsSearch.length === 0 && !searchTerm) return null;
    return (
        <div className="p-4 relative">
            {productsSearch.map((product, index) => (
                <ProductBulk product={product} key={index} />
            ))}
        </div>
    );
}
