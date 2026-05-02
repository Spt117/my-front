"use client";
import { bulkUpdateStock } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import useUpdateEffect from "@/library/hooks/useUpdateEffect";
import { ProductGET } from "@/library/types/graph";
import { ArrowUpRight, Check, CheckCircle2, Filter, Hash, Layers, Package, Search, Settings2, XCircle } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ProductBulk from "./ProductBulk";
import useBulkStore from "./storeBulk";
import TagAutocomplete from "./TagAutocomplete";

// ========================
// Types
// ========================
type TCanal = { id: string; name: string };
type TCanalWithState = TCanal & { isPublished: boolean };

type TDataUpdate = {
    id: string;
    canaux: TCanalWithState[];
};

// ========================
// Helpers
// ========================
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

// ========================
// Composants
// ========================

/**
 * Barre d'actions pour les produits sélectionnés
 */
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

/**
 * Header de la page Bulk avec filtres et statistiques
 */
interface BulkHeaderProps {
    total: number;
    selectedCount: number;
    filterByTag: string;
    onFilterChange: (value: string) => void;
    onToggleSelectAll: () => void;
    tagCandidates: string[];
}

const BulkHeader = memo(function BulkHeader({ total, selectedCount, filterByTag, onFilterChange, onToggleSelectAll, tagCandidates }: BulkHeaderProps) {
    const allSelected = selectedCount === total && total > 0;

    // Suggestions calculées localement à partir des tags des produits déjà chargés.
    const suggestions = useMemo(() => {
        const q = filterByTag.trim().toLowerCase();
        if (!q) return tagCandidates.slice(0, 12);
        return tagCandidates.filter((t) => t.toLowerCase().includes(q)).slice(0, 12);
    }, [tagCandidates, filterByTag]);

    return (
        <div className="sticky top-12 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                {/* Statistiques compactes */}
                <div className="flex items-center gap-2 text-sm">
                    <Layers size={16} className="text-blue-600" />
                    <span className="font-semibold text-slate-800">{total}</span>
                    <span className="text-slate-500">produit{total > 1 ? "s" : ""}</span>
                    {selectedCount > 0 && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-blue-600">{selectedCount}</span>
                            <span className="text-blue-600">sélectionné{selectedCount > 1 ? "s" : ""}</span>
                        </>
                    )}
                </div>

                {/* Filtre local avec autocomplete */}
                <div className="flex-1 min-w-[220px] max-w-md">
                    <TagAutocomplete
                        value={filterByTag}
                        onChange={onFilterChange}
                        suggestions={suggestions}
                        placeholder={tagCandidates.length > 0 ? `Filtrer parmi ${tagCandidates.length} tag${tagCandidates.length > 1 ? "s" : ""}…` : "Filtrer par tag…"}
                        leftIcon={<Filter size={15} />}
                        disabled={tagCandidates.length === 0}
                    />
                </div>

                {/* Sélection */}
                {total > 0 && (
                    <Button variant={allSelected ? "default" : "outline"} size="sm" onClick={onToggleSelectAll} className="gap-2 ml-auto">
                        {allSelected ? (
                            <>
                                <XCircle size={15} />
                                Désélectionner
                            </>
                        ) : (
                            <>
                                <Check size={15} />
                                Tout sélectionner
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
});

/**
 * Modal de modification du stock en masse
 */
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

                    return {
                        sku: p.variants?.nodes[0]?.sku || "",
                        quantity: newQuantity,
                    };
                })
                .filter((item) => item.sku);

            const res = await bulkUpdateStock({
                domain,
                items,
            });

            if (!res || res.error) {
                toast.error(res?.error || "Erreur lors de la mise à jour");
            } else {
                toast.success(res.message || "Stock mis à jour");
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package size={20} className="text-blue-500" />
                        Modifier le stock ({selectedProducts.length} produit{selectedProducts.length > 1 ? "s" : ""})
                    </h2>

                    {/* Mode de modification */}
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

                    {/* Quantité */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Quantité</label>
                        <Input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Entrez la quantité..." className="text-lg" />
                        <p className="text-xs text-gray-500 mt-1">
                            {mode === "set" && "Le stock sera défini à cette valeur"}
                            {mode === "add" && "Cette quantité sera ajoutée au stock actuel"}
                            {mode === "subtract" && "Cette quantité sera retirée du stock actuel"}
                        </p>
                    </div>

                    {/* Actions */}
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

/**
 * Liste des produits
 */
const ProductList = memo(function ProductList({ products, hasLoadedAny, hasFilter, onClearFilter }: { products: ProductGET[]; hasLoadedAny: boolean; hasFilter: boolean; onClearFilter: () => void }) {
    if (products.length === 0) {
        // Cas 1 : aucune recherche n'a encore chargé de produits
        if (!hasLoadedAny) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/60 p-10 max-w-md text-center shadow-sm">
                        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center">
                            <Search size={26} className="text-blue-500" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Édition en masse</h3>
                        <p className="text-sm text-slate-500 mb-4">Lance une recherche depuis la barre du haut (titre, tag, ou produits manquant un canal) pour afficher la liste à éditer.</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ArrowUpRight size={14} />
                            <span>Sélectionne le mode dans le menu déroulant en haut</span>
                        </div>
                    </div>
                </div>
            );
        }
        // Cas 2 : la recherche a chargé des produits, mais le filtre local n'en garde aucun
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Hash size={40} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">Aucun produit ne correspond à ce tag</p>
                {hasFilter && (
                    <Button variant="link" size="sm" className="mt-2" onClick={onClearFilter}>
                        Effacer le filtre
                    </Button>
                )}
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

// ========================
// Page principale
// ========================
export default function Page() {
    const { productsSearch, setProductsSearch, shopifyBoutique, canauxBoutique, openDialog } = useShopifyStore();

    const { setSelectedProducts, selectedProducts, setFilteredProducts, filterByTag, setFilterByTag, dataUpdate, setDataUpdate } = useBulkStore();

    const [showStockModal, setShowStockModal] = useState(false);

    // Reset quand la boutique change
    useUpdateEffect(() => {
        setProductsSearch([]);
        setSelectedProducts([]);
    }, [shopifyBoutique?.domain]);

    // Produits filtrés
    const filteredProducts = useMemo<ProductGET[]>(
        () => (filterByTag ? productsSearch.filter((p: ProductGET) => p.tags.some((tag) => tag.toLowerCase().includes(filterByTag.toLowerCase()))) : productsSearch),
        [productsSearch, filterByTag],
    );

    // Tags distincts présents dans les produits chargés (pour l'autocomplete local)
    const tagCandidates = useMemo<string[]>(() => {
        const set = new Set<string>();
        for (const p of productsSearch) for (const t of p.tags || []) if (t) set.add(t);
        return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
    }, [productsSearch]);

    // Synchronise le store
    useEffect(() => {
        setFilteredProducts(filteredProducts);
    }, [filteredProducts, setFilteredProducts]);

    // Sélectionner / Désélectionner tout
    const onSelectAll = useCallback(() => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
            setDataUpdate([]);
            return;
        }

        setSelectedProducts(filteredProducts);

        if (canauxBoutique?.length) {
            const payload = buildDataUpdate(filteredProducts, canauxBoutique);
            setDataUpdate(payload);
        } else {
            setDataUpdate([]);
        }
    }, [selectedProducts.length, filteredProducts, setSelectedProducts, setDataUpdate, canauxBoutique]);

    // Recalcule dataUpdate quand la sélection change
    useEffect(() => {
        if (!canauxBoutique?.length) return;
        if (!selectedProducts.length) {
            setDataUpdate([]);
            return;
        }
        const payload = buildDataUpdate(selectedProducts, canauxBoutique);
        setDataUpdate(payload);
    }, [selectedProducts, canauxBoutique, setDataUpdate]);

    // Callback après mise à jour du stock
    const handleStockUpdateSuccess = useCallback(() => {
        // Optionnel: rafraîchir les produits si nécessaire
    }, []);

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Header */}
            <BulkHeader
                total={filteredProducts.length}
                selectedCount={selectedProducts.length}
                filterByTag={filterByTag}
                onFilterChange={setFilterByTag}
                onToggleSelectAll={onSelectAll}
                tagCandidates={tagCandidates}
            />

            {/* Liste des produits */}
            <ProductList
                products={filteredProducts}
                hasLoadedAny={productsSearch.length > 0}
                hasFilter={!!filterByTag}
                onClearFilter={() => setFilterByTag("")}
            />

            {/* Barre d'actions flottante */}
            <BulkActionsBar
                selectedCount={selectedProducts.length}
                onOpenActions={() => openDialog(7)}
                onUpdateStock={() => setShowStockModal(true)}
                isDisabled={!dataUpdate.length}
            />

            {/* Modal de modification du stock */}
            <StockModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                selectedProducts={selectedProducts}
                domain={shopifyBoutique?.domain || ""}
                onSuccess={handleStockUpdateSuccess}
            />
        </div>
    );
}
