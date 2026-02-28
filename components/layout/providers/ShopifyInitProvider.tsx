'use client';

import useShopifyStore from '@/components/shopify/shopifyStore';
import { IShopifyBase } from '@/library/pocketbase/ShopifyBoutiqueService';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ShopifyInitProvider({ children, boutiques }: { children: React.ReactNode; boutiques: IShopifyBase[] }) {
    const { shopifyBoutique, setShopifyBoutique, setAllBoutiques } = useShopifyStore();
    const pathname = usePathname();

    useEffect(() => {
        setAllBoutiques(boutiques);
    }, [boutiques]);

    useEffect(() => {
        // Vérifier si on est sur une page /shopify/[id]/...
        // Dans ce cas, ne pas définir la boutique par défaut car ShopLayoutClient s'en charge
        const shopifyPageMatch = pathname?.match(/^\/shopify\/(\d+)/);
        if (shopifyPageMatch) {
            return;
        }

        // Initialiser la boutique par défaut seulement si aucune n'est définie
        if (!shopifyBoutique) {
            const defaultBoutique = boutiques.find((b) => b.domain === 'bayblade-shops.myshopify.com');
            if (defaultBoutique) {
                setShopifyBoutique(defaultBoutique);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, boutiques]);

    return <>{children}</>;
}
