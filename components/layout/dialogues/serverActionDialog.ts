"use server";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function serverActionDuplicateOtherShop(data: { domainsDest: string; productId: string; tags: string[]; domainOrigin: string; productType: string; productBrand: string }) {
    const uri = `${pokeUriServer}/shopify/duplicate`;
    const res = await postServer(uri, data);
    return res;
}
