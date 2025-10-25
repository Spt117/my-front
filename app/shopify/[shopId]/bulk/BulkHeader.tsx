import Selecteur from "@/components/selecteur";
import { getDataBoutique } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { ProductGET } from "@/library/types/graph";
import { modes } from "@/params/menu";
import { useEffect, useState } from "react";
import { search } from "../../../../components/header/serverSearch";
import { SearchByTag } from "./server";
import { toast } from "sonner";

export default function BulkHeader() {
    const { setProductsSearch, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!shopifyBoutique) return;
        setLoading(true);
        switch (searchMode) {
            case "standard":
                try {
                    if (!searchTerm.trim()) return;
                    const res = await search(searchTerm.trim(), shopifyBoutique.domain);
                    setProductsSearch(res);
                    console.log(res);
                } catch (error) {
                    console.error("Erreur lors de la recherche:", error);
                } finally {
                    setLoading(false);
                }
                break;
            case "productsMissingChannels":
                try {
                    const data = await getDataBoutique(shopifyBoutique!.domain, "productsMissingChannels");
                    setProductsSearch((data.response as ProductGET[]) || []);
                } catch {
                } finally {
                    setLoading(false);
                }
            case "tags":
                try {
                    if (!searchTerm.trim()) return;
                    console.log(shopifyBoutique);

                    const res = await SearchByTag(searchTerm.trim(), shopifyBoutique.domain);
                    if (res.error) {
                        console.log(res.error);
                        toast.error("Erreur lors de la recherche par tag: " + res.error);
                        setProductsSearch([]);
                        return;
                    }
                    if (res.message) toast.success(res.message);
                    setProductsSearch(res.response || []);
                    console.log(res);
                } catch (error) {
                    console.error("Erreur lors de la recherche:", error);
                } finally {
                    setLoading(false);
                }
        }
    };

    useEffect(() => {
        handleSearch();
    }, [searchTerm, shopifyBoutique]);

    useKeyboardShortcuts("Enter", () => handleSearch());

    return (
        <div className="w-full flex gap-2">
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
