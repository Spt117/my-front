"use client";
import { actionBulk } from "@/app/shopify/[shopId]/bulk/server";
import ProductList from "@/components/header/products/Products";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { BulkAction } from "@/components/shopify/typesShopify";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ProductGET } from "@/library/types/graph";
import { Check, CheckCircle2, FileEdit, Loader2, RefreshCw, Rocket, Search, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function DraftProducts({ products, error }: { products: ProductGET[]; error?: string | null }) {
    const router = useRouter();
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [displayProducts, setDisplayProducts] = useState<ProductGET[]>(products);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [publishing, setPublishing] = useState(false);
    const { searchTerm, setSearchTerm } = useShopifyStore();

    console.log("[DraftProducts] products prop:", products.length, "| displayProducts:", displayProducts.length, "| searchTerm:", searchTerm);

    // Effet pour synchroniser et fusionner les produits lors des rafraîchissements
    useEffect(() => {
        if (!products || products.length === 0) return;

        setDisplayProducts((prev) => {
            const next = [...prev];
            let hasChanged = false;

            products.forEach((newProduct) => {
                const index = next.findIndex((p) => p.id === newProduct.id);
                if (index !== -1) {
                    // Mise à jour si nécessaire (comparaison superficielle ou profonde selon besoin, ici on met à jour systématiquement)
                    next[index] = newProduct;
                } else {
                    // Ajout au début si nouveau
                    next.unshift(newProduct);
                    hasChanged = true;
                }
            });

            return hasChanged ? [...next] : next;
        });
    }, [products]);

    // Filtrage des produits par titre ou SKU via le store global
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return displayProducts;
        const query = searchTerm.toLowerCase();
        return displayProducts.filter((product) => {
            const hasMatchTitle = product.title.toLowerCase().includes(query);
            const hasMatchHandle = product.handle.toLowerCase().includes(query);
            const hasMatchSku = product.variants?.nodes?.some((v) => v.sku.toLowerCase().includes(query));
            return hasMatchTitle || hasMatchHandle || hasMatchSku;
        });
    }, [displayProducts, searchTerm]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const toggleSelect = (productId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
        }
    };

    const handleBulkPublish = async () => {
        if (!shopifyBoutique?.domain || selectedIds.size === 0) return;
        setPublishing(true);
        try {
            const canauxIds = canauxBoutique.map((c) => c.id);
            const payload: BulkAction = {
                productsId: Array.from(selectedIds),
                domain: shopifyBoutique.domain,
                actionType: "quick_publish",
                canauxIds,
            };
            const res = await actionBulk(payload);
            if (res.error) toast.error(res.error);
            if (res.message) {
                toast.success(res.message);
                // Retrait local des produits publiés pour éviter de les voir rester si le serveur est lent à rafraîchir
                setDisplayProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
            }
            setSelectedIds(new Set());
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la publication en masse");
        } finally {
            setPublishing(false);
        }
    };

    const allSelected = selectedIds.size === filteredProducts.length && filteredProducts.length > 0;

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileEdit className="h-5 w-5 text-amber-500" />
                        <h2 className="text-lg font-semibold">Produits en brouillon ({displayProducts.length})</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {filteredProducts.length > 0 && (
                            <Button variant={allSelected ? "default" : "outline"} size="sm" onClick={toggleSelectAll}>
                                {allSelected ? (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Tout désélectionner
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Tout sélectionner
                                    </>
                                )}
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                            Actualiser
                        </Button>
                    </div>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    {searchTerm ? (
                        <>
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Aucun brouillon ne correspond à votre recherche</p>
                            <Button variant="link" size="sm" onClick={() => setSearchTerm("")} className="mt-2 text-amber-600">
                                Effacer la recherche
                            </Button>
                        </>
                    ) : (
                        <>
                            <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun produit en brouillon</p>
                            <p className="text-sm">Tous les produits sont publiés !</p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="flex items-center gap-2 group">
                                <Checkbox checked={selectedIds.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} className="ml-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <ProductList product={product} compact />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                </>
            )}

            {/* Barre d'actions flottante */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-400" />
                        <strong>{selectedIds.size}</strong> produit{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
                    </span>
                    <div className="w-px h-6 bg-gray-600" />
                    <Button size="sm" variant="secondary" onClick={handleBulkPublish} disabled={publishing}>
                        {publishing ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Publication...
                            </>
                        ) : (
                            <>
                                <Rocket size={16} className="mr-2" />
                                Publier la sélection
                            </>
                        )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())} className="bg-transparent border-gray-500 hover:bg-gray-800">
                        <XCircle size={16} className="mr-2" />
                        Annuler
                    </Button>
                </div>
            )}
        </div>
    );
}
