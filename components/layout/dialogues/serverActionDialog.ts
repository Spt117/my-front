"use server";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";

export async function serverActionDuplicateOtherShop(data: { domainsDest: TDomainsShopify; productId: string; tags: string[]; domainOrigin: TDomainsShopify; productType: string; productBrand: string }) {
    const uri = `${pokeUriServer}/shopify/duplicate`;
    const res = await postServer(uri, data);
    return res;
}
