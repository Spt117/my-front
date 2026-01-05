'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { searchClients } from '../../shopify/clients/serverAction';
import useClientsStore from '../../shopify/clients/store';
import useShopifyStore from '../../shopify/shopifyStore';
import { Input } from '../../ui/input';
import ListClients from './ListClients';

export default function SearchClient() {
    const { shopifyBoutique } = useShopifyStore();
    const { clientsSearch, setClientsSearch, searchTermClient, setSearchTermClient, isLoading, setIsLoading } = useClientsStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) return;

        try {
            const res = await searchClients(shopifyBoutique.domain, query);
            setClientsSearch(res);
        } catch (error) {
            console.error('Erreur lors de la recherche des clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchTermClient('');
                setClientsSearch([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!searchTermClient) {
            setClientsSearch([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        timeoutRef.current = setTimeout(() => {
            handleSearch(searchTermClient);
        }, 300);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchTermClient, shopifyBoutique]);

    return (
        <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input
                            disabled={!shopifyBoutique}
                            type="text"
                            value={searchTermClient}
                            onChange={(e) => setSearchTermClient(e.target.value)}
                            placeholder="Rechercher un client (Nom, Email...)"
                            className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                        />

                        {searchTermClient && !isLoading && (
                            <button
                                type="button"
                                onClick={() => setSearchTermClient('')}
                                className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {isLoading && (
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
