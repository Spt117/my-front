'use client';

import { ShopifyCustomer } from '@/library/shopify/clients';
import { Mail, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useClientsStore from '../../shopify/clients/store';
import useShopifyStore from '../../shopify/shopifyStore';

export default function ClientItem({ client }: { client: ShopifyCustomer }) {
    const { shopifyBoutique } = useShopifyStore();
    if (!shopifyBoutique) return null;

    const id = client.id?.split('/').pop() || '';
    const url = `/shopify/${shopifyBoutique.id}/clients/${id}`;
    const { setSearchTermClient, setClientsSearch } = useClientsStore();

    const searchParams = useSearchParams();
    const router = useRouter();

    const handleClick = () => {
        // La navigation est gérée par le Link
    };

    return (
        <Link href={`${url}?${searchParams.toString()}`} className="block hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            <div className="flex items-center py-3 px-4 gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <User size={20} />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {client.firstName} {client.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{client.email || "Pas d'email"}</span>
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end text-xs font-medium text-gray-700">
                        <ShoppingBag size={12} className="text-indigo-500" />
                        {client.numberOfOrders || 0}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        {client.amountSpent?.amount || '0'} {client.amountSpent?.currencyCode || ''}
                    </div>
                </div>
            </div>
        </Link>
    );
}
