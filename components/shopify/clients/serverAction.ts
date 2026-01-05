'use server';

import { FullShopifyCustomer, ShopifyCustomer, ShopifyCustomerResponse } from '@/library/shopify/clients';
import { getServer, postServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { TDomainsShopify } from '@/params/paramsShopify';

export async function getClients(domain: TDomainsShopify, after?: string) {
    const url = `${pokeUriServer}/shopify/get-clients?domain=${domain}${after ? `&after=${after}` : ''}`;
    const response = await getServer(url);
    if (!response || !response.response) return null;
    return response.response as ShopifyCustomerResponse;
}

export async function getFullClient(domain: TDomainsShopify, clientId: string) {
    const url = `${pokeUriServer}/shopify/get-full-client?domain=${domain}&clientId=${clientId}`;
    const response = await getServer(url);
    if (!response || !response.response) return null;
    return response.response as FullShopifyCustomer;
}

export async function searchClients(domain: TDomainsShopify, query: string) {
    const url = `${pokeUriServer}/shopify/search-clients`;
    const response = await postServer(url, { domain, query });
    if (!response || !response.response) return [];
    return response.response as ShopifyCustomer[];
}
