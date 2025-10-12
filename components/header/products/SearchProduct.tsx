import { Button } from "@/components/ui/button";
import useClickOutside from "@/library/hooks/useClickOutside";
import { Plus, X } from "lucide-react";
import { useEffect, useRef } from "react";
import useShopifyStore from "../../shopify/shopifyStore";
import { Input } from "../../ui/input";
import { search } from "../serverSearch";
import ShopifySelect from "../ShopifySelect";
import ListProducts from "./ListProducts";
import { ProductGET } from "@/library/types/graph";

/**
 * Groupe un array de produits Shopify par le SKU de leur première variante
 * @param products Array de produits Shopify
 * @returns Array d'arrays de produits groupés par SKU identique
 */
export function groupProductsBySku(products: ProductGET[]): ProductGET[][] {
    // Créer une Map pour grouper les produits par SKU
    const skuGroups = new Map<string, ProductGET[]>();

    products.forEach((product) => {
        // Récupérer le SKU de la première variante
        const firstVariant = product.variants.nodes[0];

        if (firstVariant) {
            const sku = firstVariant.sku;

            // Si le SKU existe déjà dans la Map, ajouter le produit au groupe
            if (skuGroups.has(sku)) {
                skuGroups.get(sku)!.push(product);
            } else {
                // Sinon, créer un nouveau groupe avec ce produit
                skuGroups.set(sku, [product]);
            }
        }
    });

    // Convertir la Map en array d'arrays
    return Array.from(skuGroups.values());
}

export default function SearchProduct() {
    const { shopifyBoutique, setProductsSearch, searchTerm, setSearchTerm, loading, setLoading } = useShopifyStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const ref = useClickOutside<HTMLDivElement>(() => setSearchTerm(""));
    const { openDialog } = useShopifyStore();

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) return;

        try {
            const res = await search(query, shopifyBoutique.domain);
            setProductsSearch(res);
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
            setProductsSearch([]);
            setLoading(false);
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
        <div className="w-full flex gap-2">
            <ShopifySelect />
            <div className="relative flex-1" ref={ref}>
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input disabled={!shopifyBoutique} type="text" value={searchTerm} onChange={handleInputChange} placeholder="Produit Shopify" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10" />

                        {searchTerm && !loading && (
                            <button type="button" onClick={() => setSearchTerm("")} className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Effacer la recherche">
                                <X size={16} />
                            </button>
                        )}

                        {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                    <Button onClick={() => openDialog(1)} aria-label="Ajouter un produit" className="p-2" title="Ajouter un produit">
                        <Plus size={16} />
                    </Button>
                </div>
                {/* Liste des produits positionnée sous l'input */}
                <ListProducts />
            </div>
        </div>
    );
}
