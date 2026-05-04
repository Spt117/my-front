"use client";
import { bulkUpdateStock, getDataBoutique } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { ProductGET } from "@/library/types/graph";
import { ArrowUpRight, CheckCircle2, Hash, Loader2, Package, Search, Settings2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BulkFilterBar from "./BulkFilterBar";
import { buildShopifyQuery, hasActiveFilters } from "./bulkQuery";
import ProductBulk from "./ProductBulk";
import { searchProductsAdvanced } from "./server";
import useBulkStore from "./storeBulk";
import useBulkFiltersSync from "./useBulkFiltersSync";

// ─── Types & helpers ────────────────────────────────────────────────────────

type TCanal = { id: string; name: string };
type TCanalWithState = TCanal & { isPublished: boolean };

type TDataUpdate = {
    id: string;
    canaux: TCanalWithState[];
};

const buildCanauxForProduct = (product: ProductGET, canauxBoutique: TCanal[]): TCanalWithState[] => {
    return canauxBoutique.map((c) => {
        const found = product.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        return { id: c.id, name: c.name, isPublished: found?.isPublished ?? false };
    });
};

const buildDataUpdate = (products: ProductGET[], canauxBoutique: TCanal[]): TDataUpdate[] => {
    return products.map((p) => ({
        id: p.id,
        canaux: buildCanauxForProduct(p, canauxBoutique),
    }));
};

// Filtre client fin (variante 0). Shopify a déjà filtré largement côté serveur,
// on raffine ici pour respecter "variante 0 uniquement".
function applyClientFilters(
    products: ProductGET[],
    opts: { priceMin: number | null; priceMax: number | null; missingChannels: boolean; canauxCount: number },
): ProductGET[] {
    const { priceMin, priceMax, missingChannels, canauxCount } = opts;
    const minActive = priceMin !== null;
    const maxActive = priceMax !== null;
    if (!minActive && !maxActive && !missingChannels) return products;

    return products.filter((p) => {
        if (minActive || maxActive) {
            const price = parseFloat(p.variants?.nodes?.[0]?.price ?? "");
            if (!Number.isFinite(price)) return false;
            if (minActive && price < (priceMin as number)) return false;
            if (maxActive && price > (priceMax as number)) return false;
        }
        if (missingChannels && canauxCount > 0) {
            const publishedCount = p.resourcePublicationsV2?.nodes?.filter((n) => n.isPublished).length ?? 0;
            if (publishedCount >= canauxCount) return false;
        }
        return true;
    });
}

// ─── Composants annexes ─────────────────────────────────────────────────────

interface BulkActionsBarProps {
    selectedCount: number;
    onOpenActions: () => void;
    onUpdateStock: () => void;
    isDisabled: boolean;
}

const BulkActionsBar = memo(function BulkActionsBar({ selectedCount, onOpenActions, onUpdateStock, isDisabled }: BulkActionsBarProps) {
    if (selectedCount === 0) return null;
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <span className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                <strong>{selectedCount}</strong> produit{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
            </span>
            <div className="w-px h-6 bg-gray-600" />
            <Button size="sm" variant="secondary" onClick={onOpenActions} disabled={isDisabled}>
                <Settings2 size={16} className="mr-2" />
                Actions en masse
            </Button>
            <Button size="sm" variant="outline" onClick={onUpdateStock} className="bg-transparent border-gray-500 hover:bg-gray-800">
                <Package size={16} className="mr-2" />
                Modifier stock
            </Button>
        </div>
    );
});

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: ProductGET[];
    domain: string;
    onSuccess: () => void;
}

function StockModal({ isOpen, onClose, selectedProducts, domain, onSuccess }: StockModalProps) {
    const [quantity, setQuantity] = useState<string>("");
    const [mode, setMode] = useState<"set" | "add" | "subtract">("set");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const qty = parseInt(quantity);
        if (isNaN(qty)) {
            toast.error("Veuillez entrer une quantité valide");
            return;
        }
        setLoading(true);
        try {
            const items = selectedProducts
                .map((p) => {
                    const currentStock = p.variants?.nodes[0]?.inventoryQuantity || 0;
                    let newQuantity: number;
                    switch (mode) {
                        case "add":
                            newQuantity = currentStock + qty;
                            break;
                        case "subtract":
                            newQuantity = Math.max(0, currentStock - qty);
                            break;
                        default:
                            newQuantity = qty;
                    }
                    return { sku: p.variants?.nodes[0]?.sku || "", quantity: newQuantity };
                })
                .filter((item) => item.sku);

            const res = await bulkUpdateStock({ domain, items });
            if (!res || res.error) toast.error(res?.error || "Erreur lors de la mise à jour");
            else {
                toast.success(res.message || "Stock mis à jour");
                onSuccess();
                onClose();
            }
        } catch {
            toast.error("Erreur lors de la mise à jour du stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package size={20} className="text-blue-500" />
                        Modifier le stock ({selectedProducts.length} produit{selectedProducts.length > 1 ? "s" : ""})
                    </h2>
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Mode</label>
                        <div className="flex gap-2">
                            <Button size="sm" variant={mode === "set" ? "default" : "outline"} onClick={() => setMode("set")}>
                                Définir à
                            </Button>
                            <Button size="sm" variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")}>
                                Ajouter
                            </Button>
                            <Button size="sm" variant={mode === "subtract" ? "default" : "outline"} onClick={() => setMode("subtract")}>
                                Retirer
                            </Button>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Quantité</label>
                        <Input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Entrez la quantité..." className="text-lg" />
                        <p className="text-xs text-gray-500 mt-1">
                            {mode === "set" && "Le stock sera défini à cette valeur"}
                            {mode === "add" && "Cette quantité sera ajoutée au stock actuel"}
                            {mode === "subtract" && "Cette quantité sera retirée du stock actuel"}
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading || !quantity}>
                            {loading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Mise à jour...
                                </>
                            ) : (
                                "Appliquer"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const ProductList = memo(function ProductList({
    products,
    hasFiltersActive,
    isInitialLoading,
}: {
    products: ProductGET[];
    hasFiltersActive: boolean;
    isInitialLoading: boolean;
}) {
    if (isInitialLoading && products.length === 0) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 size={20} className="animate-spin mr-2" />
                Chargement…
            </div>
        );
    }

    if (products.length === 0) {
        if (!hasFiltersActive) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/60 p-10 max-w-md text-center shadow-sm">
                        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center">
                            <Search size={26} className="text-blue-500" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Édition en masse</h3>
                        <p className="text-sm text-slate-500 mb-4">Les 50 produits les plus récents sont chargés par défaut. Affine via les filtres.</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ArrowUpRight size={14} />
                            <span>Ajoute des filtres ci-dessus pour cibler ta sélection</span>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Hash size={40} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">Aucun produit ne correspond aux filtres actifs</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-2">
            {products.map((product) => (
                <ProductBulk product={product} key={product.id} />
            ))}
        </div>
    );
});

// ─── Page principale ────────────────────────────────────────────────────────

export default function Page() {
    useBulkFiltersSync();

    const { productsSearch, setProductsSearch, shopifyBoutique, canauxBoutique, openDialog } = useShopifyStore();
    const { setSelectedProducts, selectedProducts, setFilteredProducts, dataUpdate, setDataUpdate, filters, sort } = useBulkStore();

    const [showStockModal, setShowStockModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [endCursor, setEndCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Identité de la requête en cours pour ignorer les réponses obsolètes (race conditions).
    const requestIdRef = useRef(0);
    // Sentinelle pour l'infinite scroll.
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Reset complet quand la boutique change.
    useEffect(() => {
        setProductsSearch([]);
        setSelectedProducts([]);
        setEndCursor(null);
        setHasNextPage(false);
    }, [shopifyBoutique?.domain, setProductsSearch, setSelectedProducts]);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const doFetch = useCallback(
        async (mode: "reset" | "append") => {
            if (!shopifyBoutique?.domain) return;
            const reqId = ++requestIdRef.current;

            const query = buildShopifyQuery(filters);
            const isMissingOnly = filters.missingChannels && !hasActiveFilters({ ...filters, missingChannels: false });

            if (mode === "reset") {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                // Cas spécial : seul "missingChannels" actif → endpoint dédié, pas de pagination.
                if (isMissingOnly && mode === "reset") {
                    const data = await getDataBoutique(shopifyBoutique.domain, "productsMissingChannels");
                    if (reqId !== requestIdRef.current) return;
                    const list = (data?.response as ProductGET[]) || [];
                    setProductsSearch(list);
                    setEndCursor(null);
                    setHasNextPage(false);
                    return;
                }

                const res = await searchProductsAdvanced({
                    domain: shopifyBoutique.domain,
                    query,
                    first: 50,
                    after: mode === "append" ? endCursor ?? undefined : undefined,
                    sortKey: sort.sortKey,
                    reverse: sort.reverse,
                });

                if (reqId !== requestIdRef.current) return;

                if (res?.error) {
                    toast.error(res.error);
                    return;
                }
                const data = res?.response;
                if (!data) return;

                if (mode === "reset") {
                    setProductsSearch(data.products);
                } else {
                    // Dédup par id (au cas où une page se recouvre).
                    const seen = new Set(productsSearch.map((p) => p.id));
                    const merged = [...productsSearch];
                    for (const p of data.products) if (!seen.has(p.id)) merged.push(p);
                    setProductsSearch(merged);
                }
                setEndCursor(data.pageInfo.endCursor);
                setHasNextPage(data.pageInfo.hasNextPage);
            } catch (err) {
                console.error("Erreur fetch bulk:", err);
                if (reqId === requestIdRef.current) toast.error("Erreur lors de la recherche");
            } finally {
                if (reqId === requestIdRef.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        // productsSearch intentionnellement omis : on lit la valeur courante via la closure
        // au moment de l'append, et on ne veut pas re-déclencher fetch quand on push des
        // produits (ça créerait une boucle).
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [shopifyBoutique?.domain, filters, sort, endCursor],
    );

    // Re-fetch (reset) quand les filtres ou le tri changent — debounced.
    useEffect(() => {
        if (!shopifyBoutique?.domain) return;
        const t = setTimeout(() => {
            doFetch("reset");
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopifyBoutique?.domain, filters, sort]);

    // ── Filtre client fin (variante 0, missing channels combiné) ─────────────

    const displayedProducts = useMemo<ProductGET[]>(() => {
        return applyClientFilters(productsSearch, {
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            missingChannels: filters.missingChannels,
            canauxCount: canauxBoutique.length,
        });
    }, [productsSearch, filters.priceMin, filters.priceMax, filters.missingChannels, canauxBoutique.length]);

    useEffect(() => {
        setFilteredProducts(displayedProducts);
    }, [displayedProducts, setFilteredProducts]);

    // Nettoie la sélection si un produit sélectionné disparaît du tableau filtré.
    useEffect(() => {
        if (selectedProducts.length === 0) return;
        const visibleIds = new Set(displayedProducts.map((p) => p.id));
        const stillVisible = selectedProducts.filter((p) => visibleIds.has(p.id));
        if (stillVisible.length !== selectedProducts.length) {
            setSelectedProducts(stillVisible);
        }
    }, [displayedProducts, selectedProducts, setSelectedProducts]);

    // Recalcule dataUpdate quand la sélection change.
    useEffect(() => {
        if (!canauxBoutique?.length) return;
        if (!selectedProducts.length) {
            setDataUpdate([]);
            return;
        }
        setDataUpdate(buildDataUpdate(selectedProducts, canauxBoutique));
    }, [selectedProducts, canauxBoutique, setDataUpdate]);

    // ── Infinite scroll ──────────────────────────────────────────────────────

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting) && hasNextPage && !loading && !loadingMore) {
                    doFetch("append");
                }
            },
            { rootMargin: "300px 0px" },
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [hasNextPage, loading, loadingMore, doFetch]);

    // ── Render ───────────────────────────────────────────────────────────────

    const onRefresh = useCallback(() => {
        doFetch("reset");
    }, [doFetch]);

    const allSelected = selectedProducts.length === displayedProducts.length && displayedProducts.length > 0;
    const onToggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedProducts([]);
            setDataUpdate([]);
        } else {
            setSelectedProducts(displayedProducts);
            if (canauxBoutique.length) setDataUpdate(buildDataUpdate(displayedProducts, canauxBoutique));
        }
    }, [allSelected, displayedProducts, canauxBoutique, setSelectedProducts, setDataUpdate]);

    return (
        <div className="relative min-h-screen bg-gray-50">
            <BulkFilterBar
                totalCount={displayedProducts.length}
                selectedCount={selectedProducts.length}
                allSelected={allSelected}
                onToggleSelectAll={onToggleSelectAll}
                loading={loading}
                onRefresh={onRefresh}
            />

            <ProductList products={displayedProducts} hasFiltersActive={hasActiveFilters(filters)} isInitialLoading={loading && productsSearch.length === 0} />

            {/* Sentinel pour l'infinite scroll */}
            {hasNextPage && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6 text-slate-400 text-sm">
                    {loadingMore ? (
                        <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Chargement de la suite…
                        </>
                    ) : (
                        <span className="opacity-50">Faire défiler pour charger plus</span>
                    )}
                </div>
            )}

            <BulkActionsBar
                selectedCount={selectedProducts.length}
                onOpenActions={() => openDialog(7)}
                onUpdateStock={() => setShowStockModal(true)}
                isDisabled={!dataUpdate.length}
            />

            <StockModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                selectedProducts={selectedProducts}
                domain={shopifyBoutique?.domain || ""}
                onSuccess={() => {
                    /* refresh manuel via le bouton */
                }}
            />

        </div>
    );
}
