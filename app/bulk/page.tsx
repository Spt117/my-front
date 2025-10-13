"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import ProductBulk from "./ProductBulk";
import useBulkStore from "./storeBulk";
import { bulkUpdateCanauxVente } from "../product/serverAction";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function Page() {
    const { productsSearch, searchTerm, setSearchTerm, setProductsSearch, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const {
        setSelectedProducts,
        selectedProducts,
        setFilteredProducts,
        filterByTag,
        setFilterByTag,
        filteredProducts,
        dataUpdate,
        setDataUpdate,
    } = useBulkStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setProductsSearch([]);
        setSearchTerm("");
    }, [shopifyBoutique]);
    useEffect(() => {
        if (filterByTag) setFilteredProducts(productsSearch.filter((product) => product.tags.includes(filterByTag)));
        else setFilteredProducts(productsSearch);
    }, [filterByTag]);

    useEffect(() => {
        setFilteredProducts(productsSearch);
    }, [productsSearch]);

    useEffect(() => {
        console.log("dataUpdate", dataUpdate);
    }, [dataUpdate]);

    const onSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
            setDataUpdate([]);
        } else {
            setSelectedProducts(filteredProducts);
            const dataToAdd = filteredProducts.map((p) => {
                const canaux = canauxBoutique.map((c) => {
                    const found = p.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
                    if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
                    else return { id: c.id, isPublished: false, name: c.name };
                });
                const canauxP = canaux.filter((c) => c.isPublished);
                const canauxToUpdate = canaux.filter((c) => c.isPublished !== canauxP.find((cp) => cp.id === c.id)?.isPublished);

                const dataUpdate = {
                    id: p.id,
                    canaux: canauxToUpdate,
                };
                return dataUpdate;
            });
            setDataUpdate(dataToAdd);
        }
    };

    const handleUpdate = async () => {
        if (!shopifyBoutique) return;
        setLoading(true);
        try {
            const res = await bulkUpdateCanauxVente(shopifyBoutique.domain, dataUpdate);
            console.log(res);
        } catch (error) {
            console.error("Error updating channels:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <CardHeader className="p-3 m-0 flex sticky top-10 z-10 border-b-1 bg-white">
                <h2 className="text-lg font-semibold">Résultats de la recherche ({filteredProducts.length})</h2>
                <Input
                    className="ml-4"
                    placeholder="Filtrer par tag"
                    value={filterByTag}
                    onChange={(e) => setFilterByTag(e.target.value)}
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={handleUpdate}
                    disabled={dataUpdate.length === 0 || loading}
                >
                    Update
                    {loading && <Spinner className="ml-2" />}
                </Button>
                <Button variant="outline" size="sm" className="ml-auto" onClick={onSelectAll}>
                    {selectedProducts.length === filteredProducts.length ? "Désélectionner tout " : "Tout sélectionner "}{" "}
                    {selectedProducts.length > 0 && `(${selectedProducts.length})`}
                </Button>
            </CardHeader>
            <div className="p-4 relative space-y-2">
                {filteredProducts.map((product, index) => (
                    <ProductBulk product={product} key={index} />
                ))}
            </div>
        </div>
    );
}
