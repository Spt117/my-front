import { getMongoConnectionManager } from "@/library/auth/connector";
import { IMarketplace } from "@/library/params/paramsAmazon";
import { Connection, Model } from "mongoose";
import { createVeilleProductSchema, TVeilleProduct } from "./veilleProducts";

class ControllerVeilleProducts {
    marketplace: IMarketplace;
    collectionName: string;

    constructor(marketplace: IMarketplace, collectionName: string) {
        this.marketplace = marketplace;
        this.collectionName = collectionName;
    }

    private static instances = (marketplace: IMarketplace, collectionName: string) => new ControllerVeilleProducts(marketplace, collectionName);

    public static getInstance = (marketplace: IMarketplace, collectionName: string): ControllerVeilleProducts => {
        return ControllerVeilleProducts.instances(marketplace, collectionName);
    };

    /**
     * Récupère le modèle de la liste de veille
     */
    private async getModel(): Promise<Model<TVeilleProduct>> {
        const manager = await getMongoConnectionManager();
        const nameBdd = "veille_" + this.marketplace.name.replace(".", "_").toLowerCase();
        const connection: Connection = await manager.getConnection(nameBdd);
        const collectionName = this.collectionName;
        if (connection.models[collectionName]) return connection.models[collectionName];
        const schema = createVeilleProductSchema(collectionName);
        return connection.model<TVeilleProduct>(collectionName, schema);
    }

    async dropCollection(): Promise<boolean> {
        try {
            const manager = await getMongoConnectionManager();
            const nameBdd = "veille_" + this.marketplace.name.replace(".", "_").toLowerCase();
            const connection = await manager.getConnection(nameBdd);
            if (!connection.db) return true;
            await connection.db.dropCollection(this.collectionName);

            // Nettoyer le cache des modèles
            if (connection.models[this.collectionName]) {
                connection.deleteModel(this.collectionName);
            }
            return true;
        } catch (error) {
            console.error(`Failed to drop collection: ${error}`);
            return false;
        }
    }

    async geTVeilleProductByAsin(asin: string): Promise<TVeilleProduct | null> {
        const model = await this.getModel();
        return model.findOne({ asin }).exec();
    }

    async create(data: TVeilleProduct): Promise<TVeilleProduct | null> {
        const existing = await this.geTVeilleProductByAsin(data.asin);
        if (existing) return null;

        try {
            const model = await this.getModel();
            const doc = new model(data);
            await doc.save();
            return doc.toObject();
        } catch (error) {
            throw new Error(`Failed to create LisTVeilleProduct: ${error}`);
        }
    }

    async getFullList(): Promise<TVeilleProduct[]> {
        try {
            const model = await this.getModel();
            return model.find().exec();
        } catch (error) {
            console.log(`Failed to get full list: ${error}`);
            return [];
        }
    }

    async getCount(): Promise<number> {
        try {
            const model = await this.getModel();
            return model.countDocuments().exec();
        } catch (error) {
            console.log(`Failed to get count: ${error}`);
            return 0;
        }
    }
}

export const listVeilleController = (marketplace: IMarketplace, collectionName: string) => {
    return ControllerVeilleProducts.getInstance(marketplace, collectionName);
};
