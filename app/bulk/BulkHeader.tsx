import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { modes } from "@/library/params/menu";
import { useState } from "react";
import { search } from "../../components/header/serverSearch";
import ShopifySelect from "../../components/header/ShopifySelect";

export default function BulkHeader() {
    const { setProductsSearch, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
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
        <div className="w-full flex gap-2">
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
            <div className="flex-1 relative flex gap-2">
                <Input
                    disabled={!shopifyBoutique}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Produit Shopify"
                    className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                />

                {loading && (
                    <div className="h-full absolute right-2 flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
