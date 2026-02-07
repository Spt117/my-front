import { RecordModel } from "pocketbase";
import { pocketBaseManager } from "./Manager";

export type ProductType = "carte" | "my-booster";
export type PublicationStatus = "pending" | "processing" | "done" | "error";

export interface IShopifyPublicationRecord {
    shop: string;
    asin: string;
    marketplace: string;
    produit: ProductType;
    status: PublicationStatus;
}

export interface IShopifyPublicationRecordFull extends IShopifyPublicationRecord, RecordModel {}

class ShopifyPublicationService {
    private readonly collectionName = "shopify_publications";

    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    private async ensureConnection(): Promise<void> {
        await pocketBaseManager.ensureAdmin();
    }

    async create(data: IShopifyPublicationRecord): Promise<IShopifyPublicationRecordFull> {
        await this.ensureConnection();
        try {
            const record = await this.collection.create<IShopifyPublicationRecordFull>(data);
            return record;
        } catch (error) {
            console.error("Erreur creation tache publication:", error);
            throw error;
        }
    }

    async getAll(): Promise<IShopifyPublicationRecordFull[]> {
        await this.ensureConnection();
        try {
            const records = await this.collection.getFullList<IShopifyPublicationRecordFull>();
            return records;
        } catch (error) {
            console.error("Erreur recuperation taches publication:", error);
            throw error;
        }
    }

    async getById(id: string): Promise<IShopifyPublicationRecordFull | null> {
        await this.ensureConnection();
        try {
            const record = await this.collection.getOne<IShopifyPublicationRecordFull>(id);
            return record;
        } catch (error) {
            return null;
        }
    }

    async getByStatus(status: PublicationStatus): Promise<IShopifyPublicationRecordFull[]> {
        await this.ensureConnection();
        try {
            const records = await this.collection.getFullList<IShopifyPublicationRecordFull>({
                filter: `status = "${status}"`,
            });
            return records;
        } catch (error) {
            console.error(`Erreur recuperation taches avec statut "${status}":`, error);
            throw error;
        }
    }

    async getPending(): Promise<IShopifyPublicationRecordFull[]> {
        return this.getByStatus("pending");
    }

    async getByShop(shop: string): Promise<IShopifyPublicationRecordFull[]> {
        await this.ensureConnection();
        try {
            const records = await this.collection.getFullList<IShopifyPublicationRecordFull>({
                filter: `shop = "${shop}"`,
            });
            return records;
        } catch (error) {
            console.error(`Erreur recuperation taches pour ${shop}:`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<IShopifyPublicationRecord>): Promise<IShopifyPublicationRecordFull> {
        await this.ensureConnection();
        try {
            const record = await this.collection.update<IShopifyPublicationRecordFull>(id, data);
            return record;
        } catch (error) {
            console.error(`Erreur mise a jour tache ${id}:`, error);
            throw error;
        }
    }

    async updateStatus(id: string, status: PublicationStatus): Promise<IShopifyPublicationRecordFull> {
        return this.update(id, { status });
    }

    async delete(id: string): Promise<boolean> {
        await this.ensureConnection();
        try {
            await this.collection.delete(id);
            return true;
        } catch (error) {
            console.error(`Erreur suppression tache ${id}:`, error);
            throw error;
        }
    }

    async exists(asin: string, shop: string, marketplace: string): Promise<boolean> {
        await this.ensureConnection();
        try {
            await this.collection.getFirstListItem<IShopifyPublicationRecordFull>(
                `asin = "${asin}" && shop = "${shop}" && marketplace = "${marketplace}"`
            );
            return true;
        } catch {
            return false;
        }
    }
}

export const shopifyPublicationService = new ShopifyPublicationService();
