'use client';

import { TDomainsShopify } from '@/params/paramsShopify';
import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import ClientCompact from './ClientCompact';
import { getClients } from './serverAction';
import useClientsStore from './store';

export default function MappingClients({ shopId, domain }: { shopId: string; domain: TDomainsShopify }) {
    const { clients, setClients, filterClients, setFilterClients, isLoading, setIsLoading } = useClientsStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchInitialClients = async () => {
            setIsLoading(true);
            try {
                const data = await getClients(domain);
                if (data && data.customers) {
                    const clientsWithShop = data.customers.map((c) => ({ ...c, shop: domain }));
                    setClients(clientsWithShop);
                    setFilterClients(clientsWithShop);
                }
            } catch (error) {
                console.error('Failed to fetch clients:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialClients();
    }, [domain, setClients, setFilterClients, setIsLoading]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilterClients(clients);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = clients.filter(
            (client) => client.email.toLowerCase().includes(query) || client.firstName.toLowerCase().includes(query) || client.lastName.toLowerCase().includes(query)
        );
        setFilterClients(filtered);
    }, [searchQuery, clients, setFilterClients]);

    return (
        <div className="space-y-6">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mx-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
                            <p className="text-sm text-gray-500 font-medium">{clients.length} clients chargés</p>
                        </div>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 animate-pulse">Chargement des clients...</p>
                </div>
            ) : filterClients.length > 0 ? (
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filterClients.map((client) => (
                        <ClientCompact key={client.id} client={client} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 mx-4">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Aucun client trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">Essayez d'ajuster votre recherche</p>
                </div>
            )}
        </div>
    );
}
