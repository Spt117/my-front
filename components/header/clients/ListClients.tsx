'use client';

import { Separator } from '@/components/ui/separator';
import useClientsStore from '../../shopify/clients/store';
import ClientItem from './ClientItem';

export default function ListClients() {
    const { clientsSearch, searchTermClient } = useClientsStore();

    if (clientsSearch.length === 0 && !searchTermClient) return null;
    if (searchTermClient && clientsSearch.length === 0) return null; // Or show "No results"

    return (
        <div className="absolute top-full left-0 right-0 z-500 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {clientsSearch.map((client, index) => (
                <ClientItem client={client} key={index} />
            ))}
            <Separator />
        </div>
    );
}
