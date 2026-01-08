'use client';

import useShopifyStore from '@/components/shopify/shopifyStore';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SearchProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { searchTerm, setSearchTerm, setProductsSearch, setOrdersSearch, setClientsSearch, setIsSearchOpen, loading, mySpinner } = useShopifyStore();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastPathnameRef = useRef(pathname);

    // 0) Cursor loader effect
    useEffect(() => {
        if (loading || mySpinner) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [loading, mySpinner]);

    // 1) Sync URL -> State : Seulement au montage ou changement de page (Deep links / Navigation initiale)
    // On retire searchParams des dépendances pour éviter les conflits pendant la saisie
    useEffect(() => {
        const urlSearchTerm = searchParams.get('search') ?? '';
        if (urlSearchTerm !== searchTerm) {
            setSearchTerm(urlSearchTerm);
        }
    }, [pathname]);

    // 2) Sync URL -> State sur événement PopState (Bouton retour du navigateur)
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const urlSearchTerm = params.get('search') ?? '';
            if (urlSearchTerm !== searchTerm) {
                setSearchTerm(urlSearchTerm);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [searchTerm, setSearchTerm]);

    // 3) Sync State -> URL + Auto-clear
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const pathChanged = lastPathnameRef.current !== pathname;
        lastPathnameRef.current = pathname;

        const segments = pathname.split('/');
        const isDetailPage = segments.length > 4;

        // Auto-clear logic au changement de page détail
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

        // Update URL bar
        if (searchTerm) params.set('search', searchTerm);
        else params.delete('search');

        const query = params.toString();
        const href = query ? `${pathname}?${query}` : pathname;

        // On utilise replaceState pour ne pas polluer l'historique à chaque caractère
        if (href !== window.location.pathname + window.location.search) {
            window.history.replaceState(null, '', href);
        }
    }, [searchTerm, pathname]);

    return <>{children}</>;
}
