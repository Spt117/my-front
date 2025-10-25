import Selecteur from "@/components/selecteur";
import { getDataBoutique } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { ProductGET } from "@/library/types/graph";
import { modes } from "@/params/menu";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { search } from "../../../../components/header/serverSearch";
import { SearchByTag } from "./server";
import { toast } from "sonner";

export default function BulkHeader() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setProductsSearch, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const [loading, setLoading] = useState(false);

    // Initialiser searchTerm depuis l'URL au chargement
    useEffect(() => {
        const urlSearchTerm = searchParams.get("search");
        if (urlSearchTerm && urlSearchTerm !== searchTerm) {
            setSearchTerm(urlSearchTerm);
        }
    }, [searchParams, setSearchTerm]);

    // Mettre à jour l'URL quand searchTerm change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = params.get("search");

        // Ne rien faire si searchTerm correspond déjà à l'URL
        if (searchTerm === currentSearch) return;

        if (searchTerm) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
    }, [searchTerm, router, searchParams]);

    // Debounce pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, shopifyBoutique, searchMode]);

    const handleSearch = async () => {
        if (!shopifyBoutique) return;
        setLoading(true);
        switch (searchMode) {
            case "standard":
                try {
                    if (!searchTerm.trim()) return;
                    const res = await search(searchTerm.trim(), shopifyBoutique.domain);
                    setProductsSearch(res);
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
                    const res = await SearchByTag(searchTerm.trim(), shopifyBoutique.domain);
                    if (res.error) {
                        console.log(res.error);
                        toast.error("Erreur lors de la recherche par tag: " + res.error);
                        setProductsSearch([]);
                        return;
                    }
                    if (res.message) toast.success(res.message);
                    setProductsSearch(res.response || []);
                } catch (error) {
                    console.error("Erreur lors de la recherche:", error);
                } finally {
                    setLoading(false);
                }
        }
    };

    // Debounce pour la recherche (évite de lancer une recherche à chaque frappe)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, shopifyBoutique]);

    useKeyboardShortcuts("Enter", () => handleSearch());

    return (
        <div className="flex-1 flex gap-2">
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
