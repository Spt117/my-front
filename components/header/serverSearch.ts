"use server";

import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { ProductGET } from "@/library/types/graph";

// export const search2 = async (query: string) => {
//     const result: ProductGET[] = [];
//     for (const boutique of boutiques) {
//         try {
//             const uri = "http://localhost:9100/shopify/search";
//             const res = await postServer(uri, {
//                 domain: boutique.domain,
//                 query: query,
//             });
//             if (res && res.response) {
//                 res.response.map((p: ProductGET) => (p.domain = boutique.domain));
//                 result.push(...res.response);
//             }
//         } catch (error) {
//             console.error("Erreur lors de la recherche:", error);
//             toast.error(`Erreur lors de la recherche sur ${boutique.domain}`);
//         } finally {
//             continue;
//         }
//     }
//     return result;
// };
export const search = async (query: string, domain: TDomainsShopify): Promise<ProductGET[]> => {
    const uri = "http://localhost:9100/shopify/search";
    const data = await postServer(uri, { domain, query });
    return data.response;
};
