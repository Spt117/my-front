import { RecordModel } from "pocketbase";
import { pocketBaseManager } from "./Manager";

export interface IShopifyBoutiquePublic {
    domain: string;
    publicDomain: string;
    shopId: number;
    locationHome: number;
    vendor: string;
    niche: string;
    langue: string;
    flag: string;
    devise: string;
    amazonApiKey: string;
    isActive: boolean;
}

interface IShopifyBoutiqueRecord extends IShopifyBoutiquePublic, RecordModel {}

class ShopifyBoutiqueService {
    private readonly collectionName = "shopify_boutiques";

    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    async getAll(): Promise<IShopifyBoutiquePublic[]> {
        await pocketBaseManager.ensureAdmin();
        const records = await this.collection.getFullList<IShopifyBoutiqueRecord>();
        return records;
    }

    async getActive(): Promise<IShopifyBoutiquePublic[]> {
        await pocketBaseManager.ensureAdmin();
        const records = await this.collection.getFullList<IShopifyBoutiqueRecord>({
            filter: "isActive = true",
        });
        return records;
    }

    async getByDomain(domain: string): Promise<IShopifyBoutiquePublic | null> {
        await pocketBaseManager.ensureAdmin();
        try {
            const record = await this.collection.getFirstListItem<IShopifyBoutiqueRecord>(`domain = "${domain}"`);
            return record;
        } catch {
            return null;
        }
    }

    async getByShopId(shopId: number): Promise<IShopifyBoutiquePublic | null> {
        await pocketBaseManager.ensureAdmin();
        try {
            const record = await this.collection.getFirstListItem<IShopifyBoutiqueRecord>(`shopId = ${shopId}`);
            return record;
        } catch {
            return null;
        }
    }
}

export const shopifyBoutiqueService = new ShopifyBoutiqueService();

// ─── Types ───────────────────────────────────────────────────────────────────

const languesTraductions = ['français', 'anglais', 'espagnol', 'allemand'] as const;
export type TLangueTraduction = (typeof languesTraductions)[number];

export interface IShopifyBase {
    vendor: string;
    domain: string;
    publicDomain: string;
    locationHome: number;
    langue: TLangueTraduction;
    flag: string;
    devise: string;
    marketplaceAmazon: string;
    niche: string;
    id: number;
}

export const apiVersion = '2024-01';

const paramsDataShop = ['tags', 'productTypes', 'collections', 'salesChannels', 'productsMissingChannels', 'collectionGid'] as const;
export type TParamsDataShop = (typeof paramsDataShop)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
