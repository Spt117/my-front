"use server";

import { TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function saveDescriptionProduct(domain: TDomainsShopify, productId: string, description: string) {
    const url = `${pokeUriServer}/shopify/update-description`;
    const data = { domain, productId, description };
    const response = await postServer(url, data);
    return response;
}
