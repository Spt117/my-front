'use client';

import { boutiques, TDomainsShopify } from '@/params/paramsShopify';
import { useEffect, useRef } from 'react';
import { getOrdersByShop } from './serverAction';
import useOrdersStore from './store';

/**
 * Component that loads orders for all shops in the background
 * This ensures the order count badges are always up to date
 */
export default function OrdersLoader() {
    const { setOrdersForShop, ordersByShop } = useOrdersStore();
    const loadedRef = useRef(false);

    useEffect(() => {
        // Only load once per session
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadAllOrders = async () => {
            // Load orders for each shop in parallel
            const promises = boutiques.map(async (boutique) => {
                try {
                    const data = await getOrdersByShop(boutique.domain);
                    if (data?.orders) {
                        setOrdersForShop(boutique.domain as TDomainsShopify, data.orders);
                    }
                } catch (error) {
                    console.error(`Error loading orders for ${boutique.domain}:`, error);
                }
            });

            await Promise.all(promises);
        };

        loadAllOrders();
    }, [setOrdersForShop]);

    // This component doesn't render anything
    return null;
}
