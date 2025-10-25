"use server";
import { ProductGET } from "@/library/types/graph";
import { getServer, IResponseFetch } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function SearchByTag(tag: string, domain: string): Promise<IResponseFetch<ProductGET[]>> {
    const url = `${pokeUriServer}/shopify/search-by-tag?tag=${encodeURIComponent(tag)}&domain=${encodeURIComponent(domain)}`;
    console.log(url);

    const response = await getServer(url);
    return response;
}
