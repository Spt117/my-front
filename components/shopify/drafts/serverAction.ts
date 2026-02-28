'use server';

import { getServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { getBoutiques } from '@/params/paramsShopify';

export async function getDraftCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    const allBoutiques = await getBoutiques();
    const results = await Promise.allSettled(
        allBoutiques.map(async (boutique) => {
            const url = `${pokeUriServer}/shopify/draft-products?domain=${boutique.domain}`;
            const response = await getServer(url);
            const products = response.response?.products;
            return { domain: boutique.domain, count: Array.isArray(products) ? products.length : 0 };
        })
    );

    for (const result of results) {
        if (result.status === 'fulfilled') {
            counts[result.value.domain] = result.value.count;
        }
    }

    return counts;
}
