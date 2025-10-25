"use server";

import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";

export async function createCollection(title: string, domain: TDomainsShopify) {
    const url = `${pokeUriServer}/shopify/create-collection?domain=${domain}&title=${title}`;
    const response = await getServer(url);
    return response;
}

export async function deleteCollection(domain: TDomainsShopify, collectionGid: string) {
    const url = `${pokeUriServer}/shopify/delete-collection?domain=${domain}&collectionGid=${collectionGid}`;
    const response = await getServer(url);
    return response;
}

export async function removeProductFromCollection(domain: TDomainsShopify, collectionGid: string, productGid: string) {
    const url = `${pokeUriServer}/shopify/delete-product-from-collection?domain=${domain}&collectionGid=${collectionGid}&productGid=${productGid}`;
    const response = await getServer(url);
    return response;
}

export async function addProductToCollection(domain: TDomainsShopify, collectionGid: string, productGids: string[]) {
    const url = `${pokeUriServer}/shopify/add-product-to-collection?domain=${domain}&collectionGid=${collectionGid}&productGids=${productGids}`;
    const response = await getServer(url);
    return response;
}
