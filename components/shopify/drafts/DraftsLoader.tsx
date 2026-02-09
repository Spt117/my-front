'use client';

import { useEventListener } from '@/library/hooks/useEvent/useEvents';
import { TDomainsShopify } from '@/params/paramsShopify';
import { useCallback, useEffect, useRef } from 'react';
import useShopifyStore from '../shopifyStore';
import { getDraftCounts } from './serverAction';

export default function DraftsLoader() {
    const { setDraftCountForShop } = useShopifyStore();
    const loadedRef = useRef(false);

    const loadDraftCounts = useCallback(async () => {
        try {
            const counts = await getDraftCounts();
            for (const [domain, count] of Object.entries(counts)) {
                setDraftCountForShop(domain as TDomainsShopify, count);
            }
        } catch (error) {
            console.error('Error loading draft counts:', error);
        }
    }, [setDraftCountForShop]);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        loadDraftCounts();
    }, [loadDraftCounts]);

    useEventListener('products/create', () => loadDraftCounts());
    useEventListener('products/update', () => loadDraftCounts());

    return null;
}
