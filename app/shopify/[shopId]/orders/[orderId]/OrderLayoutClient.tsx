'use client';

import useOrdersStore from '@/components/shopify/orders/store';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface OrderLayoutClientProps {
    data: GroupedShopifyOrder | null;
    children: React.ReactNode;
    error: string | null;
    shopId: string;
}

export default function OrderLayoutClient({ data, children, error, shopId }: OrderLayoutClientProps) {
    const { setOrders, setFilterOrders, setMode } = useOrdersStore();

    useEffect(() => {
        if (data) {
            setOrders([data]);
            setFilterOrders([data]);
        }
        setMode('orders');
        if (error) toast.error(error);

        return () => {
            setOrders([]);
            setFilterOrders([]);
        };
    }, [data, error, setOrders, setFilterOrders, setMode]);

    if (!data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">{error || "Commande introuvable"}</p>
                    <Link href={`/shopify/${shopId}/orders`} className="text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
