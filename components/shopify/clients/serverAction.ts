"use server";

import { FullShopifyCustomer, ShopifyCustomer, ShopifyCustomerResponse } from "@/library/shopify/clients";
import { getServer, IResponseFetch, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function getClients(domain: string, after?: string): Promise<IResponseFetch<ShopifyCustomerResponse>> {
    const url = `${pokeUriServer}/shopify/get-clients?domain=${domain}${after ? `&after=${after}` : ""}`;
    const response = await getServer(url);
    return response as IResponseFetch<ShopifyCustomerResponse>;
}

export async function getFullClient(domain: string, clientId: string): Promise<IResponseFetch<FullShopifyCustomer>> {
    const url = `${pokeUriServer}/shopify/get-full-client?domain=${domain}&clientId=${clientId}`;
    const response = await getServer(url);
    return response as IResponseFetch<FullShopifyCustomer>;
}

export async function searchClients(domain: string, query: string): Promise<IResponseFetch<ShopifyCustomer[]>> {
    const url = `${pokeUriServer}/shopify/search-clients`;
    const response = await postServer(url, { domain, query });
    return response as IResponseFetch<ShopifyCustomer[]>;
}
