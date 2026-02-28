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
