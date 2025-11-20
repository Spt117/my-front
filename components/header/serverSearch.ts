"use server";

import { ProductGET } from "@/library/types/graph";
import { postServer } from "@/library/utils/fetchServer";
import { TDomainsShopify } from "@/params/paramsShopify";

export const search = async (query: string, domain: TDomainsShopify): Promise<ProductGET[]> => {
    const uri = "http://localhost:9100/shopify/search";
    const data = await postServer(uri, { domain, query });
    return data.response || [];
};
