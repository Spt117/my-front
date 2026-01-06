'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { searchClients } from '../../shopify/clients/serverAction';
import useShopifyStore from '../../shopify/shopifyStore';
import { Input } from '../../ui/input';
import ListClients from './ListClients';

export default function SearchClient() {
    const { shopifyBoutique, searchTerm, setSearchTerm, clientsSearch, setClientsSearch, loading, setLoading } = useShopifyStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) {
            setLoading(false);
            return;
        }

        try {
            const res = await searchClients(shopifyBoutique.domain, query.trim());
            const clientsWithShop = res.map((c: any) => ({ ...c, shop: shopifyBoutique.domain }));
            setClientsSearch(clientsWithShop);
        } catch (error) {
            console.error('Erreur lors de la recherche des clients:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gestion des touches clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchTerm('');
                setClientsSearch([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSearchTerm, setClientsSearch]);

    // Effet de debounce pour la recherche
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!searchTerm || !searchTerm.trim()) {
            setClientsSearch([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        timeoutRef.current = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchTerm, shopifyBoutique]);

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
                            placeholder="Rechercher un client (Nom, Email...)"
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
                </div>
                {pathname.split('/').pop() !== 'clients' && <ListClients />}
            </div>
        </div>
    );
}
