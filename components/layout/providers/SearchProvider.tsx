'use client';

import useShopifyStore from '@/components/shopify/shopifyStore';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SearchProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { searchTerm, setSearchTerm, setProductsSearch, setOrdersSearch, setClientsSearch, setIsSearchOpen, loading, mySpinner } = useShopifyStore();
    const pathname = usePathname();

    // 0) Cursor loader effect
    useEffect(() => {
        if (loading || mySpinner) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [loading, mySpinner]);

    const searchParams = useSearchParams();
    const internalUpdateRef = useRef(false);
    const lastPathnameRef = useRef(pathname);

    // 1) Sync URL -> State (ex: back button)
    useEffect(() => {
        const urlSearchTerm = searchParams.get('search') ?? '';
        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }
        if (urlSearchTerm !== (searchTerm ?? '')) {
            setSearchTerm(urlSearchTerm);
        }
    }, [searchParams]);

    // 2) Sync State -> URL + Auto-clear
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const pathChanged = lastPathnameRef.current !== pathname;
        lastPathnameRef.current = pathname;

        const segments = pathname.split('/');
        const isDetailPage = segments.length > 4;

        // Auto-clear logic:
        // If we just navigated TO a detail page from somewhere else (or from another detail page)
        if (pathChanged && isDetailPage) {
            if (searchTerm) {
                setSearchTerm('');
                setProductsSearch([]);
                setOrdersSearch([]);
                setClientsSearch([]);
                setIsSearchOpen(false);
            }
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const currentSearch = params.get('search') ?? '';

        if ((searchTerm ?? '') === currentSearch) return;

        // SYNC TO URL (Autorisé partout maintenant)
        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');

        const query = params.toString();
        const href = query ? `${pathname}?${query}` : pathname;

        // Update URL bar without triggering Next.js navigation
        if (href !== window.location.pathname + window.location.search) {
            internalUpdateRef.current = true;
            window.history.replaceState(null, '', href);
        }
    }, [searchTerm, pathname, setSearchTerm, setProductsSearch, setOrdersSearch, setClientsSearch, setIsSearchOpen]);

    return <>{children}</>;
}
