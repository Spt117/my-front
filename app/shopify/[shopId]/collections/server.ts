"use server";

import { IShopifyBase } from "@/library/pocketbase/ShopifyBoutiqueService";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { revalidatePath } from "next/cache";

export async function updateCollection(domain: string, collectionGid: string, input: any) {
    const url = `${pokeUriServer}/shopify/update-collection`;
    const response = await postServer(url, { domain, collectionGid, input });
    return response;
}

export async function createCollection(title: string, domain: string) {
    const url = `${pokeUriServer}/shopify/create-collection?domain=${domain}&title=${title}`;
    const response = await getServer(url);
    return response;
}

export async function deleteCollection(shop: IShopifyBase, collectionGid: string) {
    const url = `${pokeUriServer}/shopify/delete-collection?domain=${shop.domain}&collectionGid=${collectionGid}`;
    const response = await getServer(url);
    revalidatePath(`/shopify/${shop.id}`, "layout");
    return response;
}

export async function removeProductFromCollection(domain: string, collectionGid: string, productGid: string) {
    const url = `${pokeUriServer}/shopify/delete-product-from-collection?domain=${domain}&collectionGid=${collectionGid}&productGid=${productGid}`;
    const response = await getServer(url);
    return response;
}

export async function addProductsToCollection(domain: string, collectionGid: string, productGids: string[]) {
    const url = `${pokeUriServer}/shopify/add-products-to-collection`;
    const response = await postServer(url, { domain, collectionGid, productGids });
    return response;
}

export async function searchProductsShopify(domain: string, query: string) {
    const url = `${pokeUriServer}/shopify/search`;
    const response = await postServer(url, { domain, query });
    return response;
}

export async function uploadCollectionImage(domain: string, collectionGid: string, imageBase64: string, filename: string) {
    const url = `${pokeUriServer}/shopify/upload-collection-image`;
    const response = await postServer(url, { domain, collectionGid, imageBase64, filename });
    return response;
}

export async function deleteCollectionImage(domain: string, collectionGid: string) {
    const url = `${pokeUriServer}/shopify/delete-collection-image`;
    const response = await postServer(url, { domain, collectionGid });
    return response;
}
