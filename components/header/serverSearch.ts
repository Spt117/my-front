"use server";

import { ProductGET } from "@/library/types/graph";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";

export const search = async (query: string, domain: TDomainsShopify): Promise<ProductGET[]> => {
    const uri = `${pokeUriServer}/shopify/search`;
    const data = await postServer(uri, { domain, query });
    return data.response || [];
};
