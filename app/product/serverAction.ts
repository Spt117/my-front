"use server";

import { TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TFieldProduct, TFieldVariant } from "./util";

export async function updateVariant(
    domain: TDomainsShopify,
    productGid: string,
    variantGid: string,
    field: TFieldVariant,
    value: number | string | boolean
) {
    const url = `${pokeUriServer}/shopify/update-variant`;
    const data = { domain, productGid, variantGid, field, value };
    const response = await postServer(url, data);
    return response;
}

export async function updateProduct(domain: TDomainsShopify, productGid: string, field: TFieldProduct, value: string) {
    const url = `${pokeUriServer}/shopify/update-product`;
    const data = { domain, productGid, field, value };
    const response = await postServer(url, data);
    return response;
}

export async function createProductFromTitle(domain: TDomainsShopify, title: string) {
    const url = `${pokeUriServer}/shopify/create-product-title`;
    const data = { domain, title };
    const response = await postServer(url, data);
    return response;
}

export async function updateCanauxVente(
    domain: TDomainsShopify,
    productId: string,
    items: { id: string; isPublished: boolean }[]
) {
    const url = `${pokeUriServer}/shopify/update-canaux-vente`;
    const data = { domain, productId, items };
    const response = await postServer(url, data);
    return response;
}
