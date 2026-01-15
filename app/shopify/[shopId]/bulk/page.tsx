"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import useUpdateEffect from "@/library/hooks/useUpdateEffect";
import { ProductGET } from "@/library/types/graph";
import { 
    Check, 
    CheckCircle2, 
    Filter, 
    Layers, 
    Package, 
    Search, 
    Settings2,
    XCircle
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ProductBulk from "./ProductBulk";
import useBulkStore from "./storeBulk";

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

const BulkActionsBar = memo(function BulkActionsBar({ 
    selectedCount, 
    onOpenActions,
    onUpdateStock,
    isDisabled 
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <span className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                <strong>{selectedCount}</strong> produit{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
            </span>
            <div className="w-px h-6 bg-gray-600" />
            <Button 
                size="sm" 
                variant="secondary" 
                onClick={onOpenActions}
                disabled={isDisabled}
            >
                <Settings2 size={16} className="mr-2" />
                Actions en masse
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={onUpdateStock}
                className="bg-transparent border-gray-500 hover:bg-gray-800"
            >
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
}

const BulkHeader = memo(function BulkHeader({
    total,
    selectedCount,
    filterByTag,
    onFilterChange,
    onToggleSelectAll,
}: BulkHeaderProps) {
    const allSelected = selectedCount === total && total > 0;

    return (
        <div className="sticky top-12 z-20 bg-white/95 backdrop-blur-sm border-b shadow-sm">
            <div className="p-4">
                {/* Titre et statistiques */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Layers size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Édition en masse</h1>
                            <p className="text-sm text-gray-500">
                                {total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
                                {selectedCount > 0 && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Bouton sélectionner tout */}
                    <Button 
                        variant={allSelected ? "default" : "outline"} 
                        size="sm" 
                        onClick={onToggleSelectAll}
                        className="gap-2"
                    >
                        {allSelected ? (
                            <>
                                <XCircle size={16} />
                                Tout désélectionner
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Tout sélectionner
                            </>
                        )}
                    </Button>
                </div>

                {/* Barre de filtres */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            className="pl-10"
                            placeholder="Filtrer par tag..."
                            value={filterByTag}
                            onChange={(e) => onFilterChange(e.target.value)}
                        />
                        {filterByTag && (
                            <button
                                onClick={() => onFilterChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                </div>
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
            const items = selectedProducts.map((p) => {
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
            }).filter((item) => item.sku);

            const res = await postServer("http://localhost:9100/shopify/bulk-update-stock", {
                domain,
                items,
            });

            if (res?.error) {
                toast.error(res.error);
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
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={onClose}
            />
            
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
                            <Button
                                size="sm"
                                variant={mode === "set" ? "default" : "outline"}
                                onClick={() => setMode("set")}
                            >
                                Définir à
                            </Button>
                            <Button
                                size="sm"
                                variant={mode === "add" ? "default" : "outline"}
                                onClick={() => setMode("add")}
                            >
                                Ajouter
                            </Button>
                            <Button
                                size="sm"
                                variant={mode === "subtract" ? "default" : "outline"}
                                onClick={() => setMode("subtract")}
                            >
                                Retirer
                            </Button>
                        </div>
                    </div>

                    {/* Quantité */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Quantité
                        </label>
                        <Input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Entrez la quantité..."
                            className="text-lg"
                        />
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
const ProductList = memo(function ProductList({ products }: { products: ProductGET[] }) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Search size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun produit trouvé</p>
                <p className="text-sm">Effectuez une recherche pour afficher des produits</p>
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

    const {
        setSelectedProducts,
        selectedProducts,
        setFilteredProducts,
        filterByTag,
        setFilterByTag,
        dataUpdate,
        setDataUpdate,
    } = useBulkStore();

    const [showStockModal, setShowStockModal] = useState(false);

    // Reset quand la boutique change
    useUpdateEffect(() => {
        setProductsSearch([]);
        setSelectedProducts([]);
    }, [shopifyBoutique?.domain]);

    // Produits filtrés
    const filteredProducts = useMemo<ProductGET[]>(
        () => (filterByTag 
            ? productsSearch.filter((p: ProductGET) => 
                p.tags.some(tag => tag.toLowerCase().includes(filterByTag.toLowerCase()))
              ) 
            : productsSearch),
        [productsSearch, filterByTag]
    );

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
            />

            {/* Liste des produits */}
            <ProductList products={filteredProducts} />

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
