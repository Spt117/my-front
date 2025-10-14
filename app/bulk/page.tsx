"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProductBulk from "./ProductBulk";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useBulkStore from "./storeBulk";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { bulkUpdateCanauxVente } from "../product/serverAction";
import { ProductGET } from "@/library/types/graph";

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

/**
 * Calcule le payload d'update pour une liste de produits.
 * Ici on renvoie simplement l'état actuel (à adapter si vous envoyez seulement les différences).
 */
const buildDataUpdate = (products: ProductGET[], canauxBoutique: TCanal[]): TDataUpdate[] => {
    return products.map((p) => ({
        id: p.id,
        canaux: buildCanauxForProduct(p, canauxBoutique),
    }));
};

/* =========================
   Sous-composants
   ========================= */

type BulkHeaderProps = {
    total: number;
    selectedCount: number;
    filterByTag: string;
    loading: boolean;
    onFilterChange: (value: string) => void;
    onToggleSelectAll: () => void;
    onUpdate: () => void;
    isUpdateDisabled: boolean;
};

const BulkHeader = memo(function BulkHeader({
    total,
    selectedCount,
    filterByTag,
    loading,
    onFilterChange,
    onToggleSelectAll,
    onUpdate,
    isUpdateDisabled,
}: BulkHeaderProps) {
    const allSelected = selectedCount === total && total > 0;

    return (
        <CardHeader className="p-3 m-0 flex sticky top-10 z-10 border-b bg-white gap-3">
            <h2 className="text-lg font-semibold">Résultats de la recherche ({total})</h2>

            <Input
                className="ml-4 max-w-xs"
                placeholder="Filtrer par tag"
                value={filterByTag}
                onChange={(e) => onFilterChange(e.target.value)}
            />

            <Button variant="outline" size="sm" className="ml-4" onClick={onUpdate} disabled={isUpdateDisabled || loading}>
                Mettre à jour
                {loading && <Spinner className="ml-2" />}
            </Button>

            <Button variant="outline" size="sm" className="ml-auto" onClick={onToggleSelectAll}>
                {allSelected ? "Désélectionner tout" : "Tout sélectionner"}
                {selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
        </CardHeader>
    );
});

type ProductListProps = {
    products: ProductGET[];
};

const ProductList = memo(function ProductList({ products }: ProductListProps) {
    return (
        <div className="p-4 relative space-y-2">
            {products.map((product) => (
                <ProductBulk product={product} key={product.id} />
            ))}
        </div>
    );
});

/* =========================
   Page principale
   ========================= */

export default function Page() {
    const { productsSearch, setSearchTerm, setProductsSearch, shopifyBoutique, canauxBoutique } = useShopifyStore();

    const {
        setSelectedProducts,
        selectedProducts,
        setFilteredProducts,
        filterByTag,
        setFilterByTag,
        // filteredProducts (on évite d'utiliser l'état dérivé du store côté client)
        dataUpdate,
        setDataUpdate,
    } = useBulkStore();

    const [loading, setLoading] = useState(false);

    // Reset recherche quand la boutique change
    useEffect(() => {
        setProductsSearch([]);
        setSearchTerm("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopifyBoutique?.domain]);

    // Produits filtrés (dérivés)
    const filteredProducts = useMemo<ProductGET[]>(
        () => (filterByTag ? productsSearch.filter((p: ProductGET) => p.tags.includes(filterByTag)) : productsSearch),
        [productsSearch, filterByTag]
    );

    // Synchronise la version "store" si nécessaire (pour compat descendante)
    useEffect(() => {
        setFilteredProducts(filteredProducts);
    }, [filteredProducts, setFilteredProducts]);

    // Select All / None
    const onSelectAll = useCallback(() => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
            setDataUpdate([]);
            return;
        }

        setSelectedProducts(filteredProducts);

        // Prépare dès maintenant dataUpdate pour le bulk (optionnel, sinon calculer à la volée dans handleUpdate)
        if (canauxBoutique?.length) {
            const payload = buildDataUpdate(filteredProducts, canauxBoutique);
            setDataUpdate(payload);
        } else {
            setDataUpdate([]);
        }
    }, [selectedProducts.length, filteredProducts, setSelectedProducts, setDataUpdate, canauxBoutique]);

    // Recalcule le dataUpdate quand la sélection change manuellement ailleurs
    useEffect(() => {
        if (!canauxBoutique?.length) return;
        if (!selectedProducts.length) {
            setDataUpdate([]);
            return;
        }
        const payload = buildDataUpdate(selectedProducts, canauxBoutique);
        setDataUpdate(payload);
    }, [selectedProducts, canauxBoutique, setDataUpdate]);

    // Action d'update
    const handleUpdate = useCallback(async () => {
        if (!shopifyBoutique?.domain) return;
        if (!dataUpdate.length) return;
        setLoading(true);
        try {
            const res = await bulkUpdateCanauxVente(shopifyBoutique.domain, dataUpdate);
            // eslint-disable-next-line no-console
            console.log(res);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error updating channels:", error);
        } finally {
            setLoading(false);
        }
    }, [shopifyBoutique?.domain, dataUpdate]);

    return (
        <div className="relative">
            <BulkHeader
                total={filteredProducts.length}
                selectedCount={selectedProducts.length}
                filterByTag={filterByTag}
                loading={loading}
                onFilterChange={setFilterByTag}
                onToggleSelectAll={onSelectAll}
                onUpdate={handleUpdate}
                isUpdateDisabled={!dataUpdate.length}
            />
            <ProductList products={filteredProducts} />
        </div>
    );
}
