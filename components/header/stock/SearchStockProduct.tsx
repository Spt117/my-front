import useVariantStore from "@/app/stock/store";
import { X } from "lucide-react";
import { useEffect } from "react";
import useShopifyStore from "../../shopify/shopifyStore";
import { Input } from "../../ui/input";

export default function SearchStockProduct() {
    const { shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const { setVariantsFilter, variants } = useVariantStore();

    useEffect(() => {
        const result = variants.filter(
            (variant) =>
                variant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                variant.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setVariantsFilter(result);
    }, [searchTerm]);

    return (
        <div className="relative w-full">
            <Input
                disabled={!shopifyBoutique}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Produit"
                className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
            />

            {searchTerm && (
                <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Effacer la recherche"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
