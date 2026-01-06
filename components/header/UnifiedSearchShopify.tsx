'use client';

import ListClients from '@/components/header/clients/ListClients';
import ListProducts from '@/components/header/products/ListProducts';
import { search as searchProducts } from '@/components/header/serverSearch';
import { searchClients } from '@/components/shopify/clients/serverAction';
import ListOrdersSearch from '@/components/shopify/orders/search/ListOrdersSearch';
import { searchOrders } from '@/components/shopify/orders/serverAction';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface UnifiedSearchShopifyProps {
    type: 'products' | 'clients' | 'orders';
}

export default function UnifiedSearchShopify({ type }: UnifiedSearchShopifyProps) {
    const { shopifyBoutique, searchTerm, setSearchTerm, loading, setLoading, setProductsSearch, setOrdersSearch, setClientsSearch, openDialog } = useShopifyStore();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const latestQueryRef = useRef<string>('');
    const pathname = usePathname();

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) {
            setLoading(false);
            return;
        }

        latestQueryRef.current = query;

        try {
            if (type === 'products') {
                const res = await searchProducts(query.trim(), shopifyBoutique.domain);
                if (latestQueryRef.current === query) setProductsSearch(res);
            } else if (type === 'clients') {
                const res = await searchClients(shopifyBoutique.domain, query.trim());
                const clientsWithShop = res.map((c: any) => ({ ...c, shop: shopifyBoutique.domain }));
                if (latestQueryRef.current === query) setClientsSearch(clientsWithShop);
            } else if (type === 'orders') {
                const res = await searchOrders(shopifyBoutique.domain, query.trim());
                if (latestQueryRef.current === query) setOrdersSearch(res as any[]);
            }
        } catch (error) {
            console.error(`Erreur lors de la recherche (${type}):`, error);
        } finally {
            if (latestQueryRef.current === query) {
                setLoading(false);
            }
        }
    };

    // Keyboard Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchTerm('');
                setProductsSearch([]);
                setOrdersSearch([]);
                setClientsSearch([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSearchTerm, setProductsSearch, setOrdersSearch, setClientsSearch]);

    // Debounce
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!searchTerm || !searchTerm.trim()) {
            setProductsSearch([]);
            setOrdersSearch([]);
            setClientsSearch([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        timeoutRef.current = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [searchTerm, shopifyBoutique, type]);

    const placeholder = {
        products: 'Produit Shopify',
        clients: 'Rechercher un client (Nom, Email...)',
        orders: 'Commande Shopify',
    }[type];

    return (
        <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input
                            disabled={!shopifyBoutique}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={placeholder}
                            className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                        />

                        {searchTerm && !loading && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                    {type === 'products' && (
                        <Button onClick={() => openDialog(1)} aria-label="Ajouter un produit" className="p-2" title="Ajouter un produit">
                            <Plus size={16} />
                        </Button>
                    )}
                </div>

                {/* List placement based on type and context */}
                {type === 'products' && pathname.split('/').pop() !== 'products' && <ListProducts />}
                {type === 'clients' && pathname.split('/').pop() !== 'clients' && <ListClients />}
                {type === 'orders' && <ListOrdersSearch />}
            </div>
        </div>
    );
}
