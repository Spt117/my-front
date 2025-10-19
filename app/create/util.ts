import { TNameMarketplace } from "@/params/paramsAmazon";
import { TPublicDomainsShopify } from "@/params/paramsShopify";
import { TDomainWordpress } from "@/params/paramsWordpress";

export interface ICreateAffiliationProduct<T> {
    idTask: string;
    website: TDomainWordpress | TPublicDomainsShopify;
    marketplace: TNameMarketplace;
    product: string;
    asin: string;
    data: T;
}

export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
