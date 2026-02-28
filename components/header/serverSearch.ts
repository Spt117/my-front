"use server";

import { ProductGET } from "@/library/types/graph";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export const search = async (query: string, domain: string): Promise<ProductGET[]> => {
    const uri = `${pokeUriServer}/shopify/search`;
    const data = await postServer(uri, { domain, query });
    return data.response || [];
};
