'use client';

import { TDomainsShopify } from '@/params/paramsShopifyTypes';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { useEffect, useRef } from 'react';
import { getOrders } from './serverAction';
import useOrdersStore from './store';

/**
 * Component that loads orders for all shops in the background
 * This ensures the order count badges are always up to date
 */
export default function OrdersLoader() {
    const { setOrdersForShop } = useOrdersStore();
    const { allBoutiques } = useShopifyStore();
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current || !allBoutiques) return;
        loadedRef.current = true;

        const loadAllOrders = async () => {
            try {
                const data = await getOrders();
                if (!data) return;

                for (const boutique of allBoutiques) {
                    const shopOrders = data.orders.filter((order) => order.shop === boutique.domain);
                    setOrdersForShop(boutique.domain as TDomainsShopify, shopOrders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        };

        loadAllOrders();
    }, [setOrdersForShop, allBoutiques]);

    return null;
}
