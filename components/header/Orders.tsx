"use client";
import ListOrdersSearch from "@/components/shopify/orders/search/ListOrdersSearch";
import { searchOrders } from "@/components/shopify/orders/serverAction";
import useOrdersStore from "@/components/shopify/orders/store";
import { ShopifyOrder } from "@/library/shopify/orders";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import useShopifyStore from "../shopify/shopifyStore";
import { Input } from "../ui/input";
import ShopifySelect from "./ShopifySelect";

export default function Orders() {
    const { setOrdersSearch } = useOrdersStore();
    const { shopifyBoutique, searchTerm, setSearchTerm, loading, setLoading } = useShopifyStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) return;

        try {
            const res = await searchOrders(shopifyBoutique.domain, query.trim());
            if (res && res) setOrdersSearch(res as ShopifyOrder[]);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        } finally {
            setLoading(false);
        }
    };

    // Effet de debounce
    useEffect(() => {
        // Nettoie le timeout précédent
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!searchTerm) {
            setOrdersSearch([]);
            return;
        }

        // Programme une nouvelle recherche
        setLoading(true);
        timeoutRef.current = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchTerm, shopifyBoutique]); // Seulement searchTerm dans les dépendances

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <>
            <div className="relative flex-1">
                <Input
                    disabled={!shopifyBoutique}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Commande Shopify"
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

                {loading && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
            <ListOrdersSearch />
        </>
    );
}
