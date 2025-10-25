"use server";
import { ProductGET } from "@/library/types/graph";
import { getServer, IResponseFetch, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function SearchByTag(tag: string, domain: string): Promise<IResponseFetch<ProductGET[]>> {
    const url = `${pokeUriServer}/shopify/search-by-tag?tag=${encodeURIComponent(tag)}&domain=${encodeURIComponent(domain)}`;
    const response = await getServer(url);
    return response;
}

export async function addProductsToCollection(
    domain: string,
    collectionGid: string,
    productGids: string[]
): Promise<IResponseFetch<null>> {
    const url = `${pokeUriServer}/shopify/add-products-to-collection`;
    const data = { domain, collectionGid, productGids };
    const response = await postServer(url, data);
    return response;
}
