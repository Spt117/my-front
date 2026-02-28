'use server';

import { ShopifyCustomerResponse, FullShopifyCustomer, ShopifyCustomer } from '@/library/shopify/clients';
import { getServer, postServer, IResponseFetch } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { TDomainsShopify } from '@/params/paramsShopifyTypes';

export async function getClients(domain: TDomainsShopify, after?: string): Promise<IResponseFetch<ShopifyCustomerResponse>> {
    const url = `${pokeUriServer}/shopify/get-clients?domain=${domain}${after ? `&after=${after}` : ''}`;
    const response = await getServer(url);
    return response as IResponseFetch<ShopifyCustomerResponse>;
}

export async function getFullClient(domain: TDomainsShopify, clientId: string): Promise<IResponseFetch<FullShopifyCustomer>> {
    const url = `${pokeUriServer}/shopify/get-full-client?domain=${domain}&clientId=${clientId}`;
    const response = await getServer(url);
    return response as IResponseFetch<FullShopifyCustomer>;
}

export async function searchClients(domain: TDomainsShopify, query: string): Promise<IResponseFetch<ShopifyCustomer[]>> {
    const url = `${pokeUriServer}/shopify/search-clients`;
    const response = await postServer(url, { domain, query });
    return response as IResponseFetch<ShopifyCustomer[]>;
}
