"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import ProductBulk from "./ProductBulk";

export default function Page() {
    const { productsSearch, searchTerm, searchMode } = useShopifyStore();

    if (productsSearch.length === 0 && !searchTerm) return null;

    console.log(productsSearch[0]);

    return (
        <div className="p-4 relative">
            {productsSearch.map((product, index) => (
                <ProductBulk product={product} key={index} />
            ))}
        </div>
    );
}
