'use client';

import useShopifyStore from '@/components/shopify/shopifyStore';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SearchProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { searchTerm, setSearchTerm } = useShopifyStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const internalUpdateRef = useRef(false);

    // 1) URL -> state
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

    // 2) state -> URL
    useEffect(() => {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const currentSearch = params.get('search') ?? '';

        if ((searchTerm ?? '') === currentSearch) return;

        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');

        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        if (typeof window !== 'undefined') {
            internalUpdateRef.current = true;
            window.history.replaceState(null, '', href);
        }

        const id = setTimeout(() => {
            router.replace(href, { scroll: false });
        }, 250);

        return () => clearTimeout(id);
    }, [searchTerm, pathname, router]);

    // 3) Auto-clear on detail page arrival
    useEffect(() => {
        const segments = pathname.split('/');
        // Détecte les pages de détail: /shopify/[id]/[products|orders|clients]/[id]
        if (segments.length > 4) {
            if (searchTerm) setSearchTerm('');
        }
    }, [pathname, setSearchTerm]); // reacts to route changes

    return <>{children}</>;
}
