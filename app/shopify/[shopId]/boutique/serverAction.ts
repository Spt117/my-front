"use server";

import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export interface ShippingTranslation {
    resourceId: string;
    key: string;
    value: string;
    digest: string;
    locale: string;
}

export async function getShopSettings(domain: string) {
    const url = `${pokeUriServer}/shopify/get-shop-settings`;
    const res = await postServer(url, { domain });
    return res.response as { amazonPartnerId: string; amazonDomain: string };
}

export async function updateShopSettings(domain: string, settings: { amazonPartnerId?: string; amazonDomain?: string }) {
    const url = `${pokeUriServer}/shopify/update-shop-settings`;
    const res = await postServer(url, { domain, settings });
    return res.response;
}

export async function getShippingTranslation(domain: string) {
    const url = `${pokeUriServer}/shopify/get-shipping-translation`;
    const res = await postServer(url, { domain });
    return res.response as ShippingTranslation | null;
}

export async function updateShippingTranslation(domain: string, data: { resourceId: string; locale: string; key: string; value: string; digest: string }) {
    const url = `${pokeUriServer}/shopify/update-shipping-translation`;
    const res = await postServer(url, { domain, ...data });
    return res.response;
}
