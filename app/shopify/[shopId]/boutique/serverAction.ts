"use server";

import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";

export async function getShopSettings(domain: TDomainsShopify) {
    const url = `${pokeUriServer}/shopify/get-shop-settings`;
    const res = await postServer(url, { domain });
    return res.response as { amazonPartnerId: string; amazonDomain: string };
}

export async function updateShopSettings(domain: TDomainsShopify, settings: { amazonPartnerId?: string; amazonDomain?: string }) {
    const url = `${pokeUriServer}/shopify/update-shop-settings`;
    const res = await postServer(url, { domain, settings });
    return res.response;
}
