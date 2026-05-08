import { pocketBaseManager } from "./Manager";

export type Availability = "InStock" | "OutOfStock" | "PreOrder" | "Discontinued" | "Unknown";

export interface IEverwishProductRecord {
    url: string;
    title: string;
    priceText: string;
    inStock: boolean;
    availability: Availability;
    wholesale: boolean;
    alertRestock: boolean;
    alertOutOfStock: boolean;
    lastChecked: string;
    lastStockChange: string;
}

export interface IEverwishProductRecordFull extends IEverwishProductRecord {
    id: string;
    created: string;
    updated: string;
}

class EverwishProductService {
    private readonly collectionName = "everwish_products";

    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    private async ensureConnection(): Promise<void> {
        await pocketBaseManager.ensureAdmin();
    }

    async getAll(): Promise<IEverwishProductRecordFull[]> {
        await this.ensureConnection();
        return this.collection.getFullList<IEverwishProductRecordFull>({ sort: "title" });
    }
}

export const everwishProductService = new EverwishProductService();
