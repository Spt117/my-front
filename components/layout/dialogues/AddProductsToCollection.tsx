'use client';

import { addProductToCollection, searchProductsShopify } from '@/app/shopify/[shopId]/collections/server';
import useCollectionStore from '@/app/shopify/[shopId]/collections/storeCollections';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner/index';
import { Check, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddProductsToCollection() {
    const { closeDialog, shopifyBoutique } = useShopifyStore();
    const { dataCollection } = useCollectionStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const router = useRouter();

    const handleSearch = async () => {
        if (!query.trim() || !shopifyBoutique) return;
        setLoadingSearch(true);
        try {
            const data = await searchProductsShopify(shopifyBoutique.domain, query);
            if (data.response) {
                // Filter out products already in collection
                const existingIds = dataCollection?.products.map((p) => p.id) || [];
                setResults(data.response.filter((p: any) => !existingIds.includes(p.id)));
            }
        } catch (error) {
            toast.error('Erreur lors de la recherche');
        } finally {
            setLoadingSearch(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleAdd = async () => {
        if (!shopifyBoutique || !dataCollection || selectedIds.length === 0) return;
        setLoadingSave(true);
        try {
            const res = await addProductToCollection(shopifyBoutique.domain, dataCollection.id, selectedIds);
            if (res.message) {
                toast.success(`${selectedIds.length} produit(s) ajouté(s)`);
                router.refresh();
                closeDialog();
            } else if (res.error) {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-h-[80vh] w-[550px]">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900">Ajouter des produits</h3>
                <span className="text-sm text-slate-500">{selectedIds.length} sélectionnés</span>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Rechercher par titre ou SKU..."
                        className="pl-10"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} disabled={loadingSearch}>
                    {loadingSearch ? <Spinner className="w-4 h-4" /> : 'Rechercher'}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] border rounded-lg divide-y bg-slate-50/30">
                {results.length > 0 ? (
                    results.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => toggleSelect(product.id)}
                            className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${selectedIds.includes(product.id) ? 'bg-blue-50' : 'hover:bg-white'}`}
                        >
                            <div className="relative w-12 h-12 rounded border bg-white overflow-hidden flex-shrink-0">
                                {product.featuredImage?.url && <Image src={product.featuredImage.url} alt={product.title} fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate">{product.title}</h4>
                                <p className="text-xs text-slate-500 font-mono">
                                    {product.variants.nodes[0].sku || 'N/A'} • {product.variants.nodes[0].price} {shopifyBoutique?.devise}
                                </p>
                            </div>
                            <div
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                    selectedIds.includes(product.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                }`}
                            >
                                {selectedIds.includes(product.id) ? <Check size={14} /> : <Plus size={14} className="text-slate-400" />}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 italic text-sm">
                        {query ? 'Aucun nouveau produit trouvé' : 'Recherchez des produits à ajouter'}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={closeDialog}>
                    Annuler
                </Button>
                <Button disabled={selectedIds.length === 0 || loadingSave} onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                    {loadingSave ? <Spinner className="w-4 h-4 mr-2" /> : null}
                    Ajouter {selectedIds.length} produit{selectedIds.length > 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
}
