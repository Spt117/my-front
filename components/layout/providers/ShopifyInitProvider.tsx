'use client';

import { boutiques } from '@/params/paramsShopify';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useShopifyStore from '@/components/shopify/shopifyStore';

export default function ShopifyInitProvider({ children }: { children: React.ReactNode }) {
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();
    const pathname = usePathname();

    useEffect(() => {
        // Vérifier si on est sur une page /shopify/[id]/...
        // Dans ce cas, ne pas définir la boutique par défaut car ShopLayoutClient s'en charge
        const shopifyPageMatch = pathname?.match(/^\/shopify\/(\d+)/);
        if (shopifyPageMatch) {
            // On est sur une page shopify avec un ID de boutique, ne rien faire
            return;
        }

        // Initialiser la boutique par défaut seulement si aucune n'est définie
        // et qu'on n'est pas sur une page /shopify/[id]/...
        if (!shopifyBoutique) {
            const defaultBoutique = boutiques.find((b) => b.domain === 'bayblade-shops.myshopify.com');
            if (defaultBoutique) {
                setShopifyBoutique(defaultBoutique);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return <>{children}</>;
}
