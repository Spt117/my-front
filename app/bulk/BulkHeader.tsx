import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import { modes } from "@/library/params/menu";
import { useState } from "react";
import { groupProductsBySku } from "../../components/header/products/SearchProduct";
import { search } from "../../components/header/serverSearch";
import ShopifySelect from "../../components/header/ShopifySelect";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";

export default function BulkHeader() {
    const { setProductsSearch, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        try {
            if (!shopifyBoutique || !searchTerm.trim()) return;
            const res = await search(searchTerm.trim(), shopifyBoutique.domain);
            setProductsSearch(res);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        } finally {
            setLoading(false);
        }
    };

    useKeyboardShortcuts("Enter", () => handleSearch());

    return (
        <>
            <ShopifySelect />
            <Selecteur
                disabled={!shopifyBoutique}
                onChange={(value) => {
                    setSearchMode(value as (typeof modes)[number]["value"]);
                }}
                array={[...modes]}
                placeholder="Mode de recheche"
                value={searchMode}
            />
            <div className="relative ">
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input disabled={!shopifyBoutique} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Produit Shopify" className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10" />

                        {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
