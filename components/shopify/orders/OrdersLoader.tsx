'use client';

import { boutiques, TDomainsShopify } from '@/params/paramsShopify';
import { useEffect, useRef } from 'react';
import { getOrders } from './serverAction';
import useOrdersStore from './store';

/**
 * Component that loads orders for all shops in the background
 * This ensures the order count badges are always up to date
 */
export default function OrdersLoader() {
    const { setOrdersForShop } = useOrdersStore();
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadAllOrders = async () => {
            try {
                const data = await getOrders();
                if (!data) return;

                for (const boutique of boutiques) {
                    const shopOrders = data.orders.filter((order) => order.shop === boutique.domain);
                    setOrdersForShop(boutique.domain as TDomainsShopify, shopOrders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        };

        loadAllOrders();
    }, [setOrdersForShop]);

    return null;
}
