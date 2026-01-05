'use client';

import useClientsStore from '@/components/shopify/clients/store';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SearchProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { searchTerm, setSearchTerm } = useShopifyStore();
    const { searchTermClient, setSearchTermClient } = useClientsStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const internalUpdateRef = useRef(false);

    // 1) URL -> state
    useEffect(() => {
        const urlSearchTerm = searchParams.get('search') ?? '';
        const urlClientSearchTerm = searchParams.get('search_client') ?? '';

        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }

        if (urlSearchTerm !== (searchTerm ?? '')) {
            setSearchTerm(urlSearchTerm);
        }
        if (urlClientSearchTerm !== (searchTermClient ?? '')) {
            setSearchTermClient(urlClientSearchTerm);
        }
    }, [searchParams]);

    // 2) state -> URL
    useEffect(() => {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const currentSearch = params.get('search') ?? '';
        const currentClientSearch = params.get('search_client') ?? '';

        if ((searchTerm ?? '') === currentSearch && (searchTermClient ?? '') === currentClientSearch) return;

        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');

        if (searchTermClient) params.set('search_client', searchTermClient);
        else params.delete('search_client');

        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        if (typeof window !== 'undefined') {
            internalUpdateRef.current = true;
            window.history.replaceState(null, '', href);
        }

        const id = setTimeout(() => {
            router.replace(href, { scroll: false });
        }, 250);

        return () => clearTimeout(id);
    }, [searchTerm, searchTermClient, pathname, router]);

    // 3) Auto-clear on detail page arrival
    useEffect(() => {
        const segments = pathname.split('/');
        // Détecte les pages de détail: /shopify/[id]/[products|orders|clients]/[id]
        if (segments.length > 4) {
            if (searchTerm) setSearchTerm('');
            if (searchTermClient) setSearchTermClient('');
        }
    }, [pathname, setSearchTerm, setSearchTermClient]); // reacts to route changes

    return <>{children}</>;
}
