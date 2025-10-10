import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { modes } from "@/library/params/menu";
import ShopifySelect from "../ShopifySelect";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import ListProducts from "../products/ListProducts";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { groupProductsBySku } from "../products/SearchProduct";
import { search } from "../serverSearch";

export default function BulkHeader() {
    const { setProductsSearch, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) return;

        try {
            const res = await search(query);
            const grouped = groupProductsBySku(res);
            setProductsSearch(grouped);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        } finally {
            setLoading(false);
        }
    };

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
            <div className="relative w-full">
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input disabled={!shopifyBoutique} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Produit Shopify" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10" />

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
