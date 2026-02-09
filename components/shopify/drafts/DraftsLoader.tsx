'use client';

import { TDomainsShopify } from '@/params/paramsShopify';
import { useEffect, useRef } from 'react';
import useShopifyStore from '../shopifyStore';
import { getDraftCounts } from './serverAction';

export default function DraftsLoader() {
    const { setDraftCountForShop } = useShopifyStore();
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        const loadDraftCounts = async () => {
            try {
                const counts = await getDraftCounts();
                for (const [domain, count] of Object.entries(counts)) {
                    setDraftCountForShop(domain as TDomainsShopify, count);
                }
            } catch (error) {
                console.error('Error loading draft counts:', error);
            }
        };

        loadDraftCounts();
    }, [setDraftCountForShop]);

    return null;
}
