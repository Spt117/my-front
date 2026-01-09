'use client';

import { boutiques } from '@/params/paramsShopify';
import { useEffect } from 'react';
import useShopifyStore from '@/components/shopify/shopifyStore';

export default function ShopifyInitProvider({ children }: { children: React.ReactNode }) {
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();

    useEffect(() => {
        // Initialiser la boutique par défaut seulement si aucune n'est définie
        if (!shopifyBoutique) {
            const defaultBoutique = boutiques.find((b) => b.domain === 'bayblade-shops.myshopify.com');
            if (defaultBoutique) {
                setShopifyBoutique(defaultBoutique);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}
