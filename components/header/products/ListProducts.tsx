"use client";
import { Separator } from "@/components/ui/separator";
import useShopifyStore from "../../shopify/shopifyStore";
import ProductList from "./Products";
import useClickOutside from "@/library/hooks/useClickOutside";

export default function ListProducts() {
    const { productsSearch, searchTerm, loading, setSearchTerm } = useShopifyStore();

    const t = useClickOutside<HTMLDivElement>(() => setSearchTerm(""));

    if (productsSearch.length === 0 && !searchTerm) return null;

    return (
        <div
            ref={t}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
            {productsSearch.map((product, index) => (
                <ProductList products={product} key={index} />
            ))}
            {!loading && searchTerm && productsSearch.length === 0 && (
                <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="relative w-12 h-12 flex-shrink-0"></div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">
                            Aucun produit trouvé pour "{searchTerm}"
                        </h3>
                    </div>
                </div>
            )}
            <Separator />
        </div>
    );
}
