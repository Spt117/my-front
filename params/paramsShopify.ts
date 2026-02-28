import { IShopifyBoutiquePublic, shopifyBoutiqueService } from "@/library/pocketbase/ShopifyBoutiqueService";

// Re-export all types from the types-only file so server-side imports still work
export type {
    TLangueTraduction,
    IShopifyBase,
    TDomainsShopify,
    TPublicDomainsShopify,
    TVendorsShopify,
    TLocationHome,
    TMarketplaceAmazonBoutique,
    IShopify,
    TParamsDataShop,
} from "./paramsShopifyTypes";
export { apiVersion } from "./paramsShopifyTypes";

import type { IShopifyBase, TLangueTraduction } from "./paramsShopifyTypes";

function toBoutiqueBase(pb: IShopifyBoutiquePublic): IShopifyBase {
    return {
        vendor: pb.vendor,
        domain: pb.domain,
        publicDomain: pb.publicDomain,
        locationHome: pb.locationHome,
        langue: pb.langue as TLangueTraduction,
        flag: pb.flag,
        devise: pb.devise,
        marketplaceAmazon: pb.amazonApiKey,
        niche: pb.niche,
        id: pb.shopId,
    };
}

export async function getBoutiques(): Promise<IShopifyBase[]> {
    const records = await shopifyBoutiqueService.getAll();
    return records.map(toBoutiqueBase);
}

export async function boutiqueFromId(id: number | string): Promise<IShopifyBase> {
    const record = await shopifyBoutiqueService.getByShopId(Number(id));
    if (!record) throw new Error(`Boutique non trouvée pour l'id: ${id}`);
    return toBoutiqueBase(record);
}

export async function boutiqueFromDomain(domain: string): Promise<IShopifyBase> {
    const record = await shopifyBoutiqueService.getByDomain(domain);
    if (!record) throw new Error(`Boutique non trouvée pour le domaine: ${domain}`);
    return toBoutiqueBase(record);
}

export async function boutiqueFromPublicDomain(domain: string): Promise<IShopifyBase> {
    const records = await shopifyBoutiqueService.getAll();
    const found = records.find((r) => r.publicDomain === domain);
    if (!found) throw new Error(`Boutique non trouvée pour le domaine public: ${domain}`);
    return toBoutiqueBase(found);
}

export async function boutiqueFromLocation(locationHome: number): Promise<IShopifyBase> {
    const records = await shopifyBoutiqueService.getAll();
    const found = records.find((r) => r.locationHome === locationHome);
    if (!found) throw new Error(`Boutique non trouvée pour la locationHome: ${locationHome}`);
    return toBoutiqueBase(found);
}

export async function getDomainsBeyblade(): Promise<string[]> {
    const records = await shopifyBoutiqueService.getAll();
    return records.filter((r) => r.vendor.includes('Beyblade')).map((r) => r.domain);
}
