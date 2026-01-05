'use client';

import useOrdersStore from '@/components/shopify/orders/store';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface OrderLayoutClientProps {
    data: GroupedShopifyOrder;
    children: React.ReactNode;
    error: string | null;
    shopId: string;
}

export default function OrderLayoutClient({ data, children, error, shopId }: OrderLayoutClientProps) {
    const { setOrders, setFilterOrders, setMode } = useOrdersStore();

    useEffect(() => {
        // Mettre à jour le store avec la commande actuelle
        setOrders([data]);
        setFilterOrders([data]);
        setMode('orders');
        if (error) toast.error(error);
    }, [data, error, setOrders, setFilterOrders, setMode]);

    return <>{children}</>;
}
