"use server";

import { boutiques } from "@/library/params/paramsShopify";
import { ProductNode } from "@/components/header/products/shopifySearch";
import { postServer } from "@/library/utils/fetchServer";
import { toast } from "sonner";

export const search2 = async (query: string) => {
    const result: ProductNode[] = [];
    for (const boutique of boutiques) {
        try {
            const uri = "http://localhost:9100/shopify/search";
            const res = await postServer(uri, {
                domain: boutique.domain,
                query: query,
            });
            if (res && res.response) {
                res.response.map((p: ProductNode) => (p.domain = boutique.domain));
                result.push(...res.response);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            toast.error(`Erreur lors de la recherche sur ${boutique.domain}`);
        } finally {
            continue;
        }
    }
    return result;
};
export const search = async (query: string): Promise<ProductNode[]> => {
    const uri = "http://localhost:9100/shopify/search";

    const promises = boutiques.map((boutique) =>
        postServer(uri, { domain: boutique.domain, query })
            .then((res) => res?.response?.map((p: ProductNode) => ({ ...p, domain: boutique.domain })) || [])
            .catch((error) => {
                console.error(`Erreur ${boutique.domain}:`, error);
                return [];
            })
    );

    const results = await Promise.all(promises);
    return results.flat();
};
