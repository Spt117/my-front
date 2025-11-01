import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { IBeybladeProduct, TBeybladeGeneration } from "../typesBeyblade";
import { BeybladeSchema } from "./model-product";

class BeybladeController {
    generation: TBeybladeGeneration;

    constructor(generation: TBeybladeGeneration) {
        this.generation = generation;
    }

    async getVariantModel(): Promise<Model<IBeybladeProduct>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Beyblade");

        const modelName = "beybladeModel";
        const collectionName = `beyblade_${this.generation}`;

        const existingModel = connection.models[modelName];
        if (existingModel) return existingModel as Model<IBeybladeProduct>;
        const Beyblade = connection.model<IBeybladeProduct>(modelName, BeybladeSchema, collectionName);
        return Beyblade;
    }

    async createBeyblade(payload: IBeybladeProduct) {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.create(payload);
            return doc;
        } catch (err) {
            console.error("createBeyblade error:", err);
            return null;
        }
    }

    async searchBeybladeByProductCodeOrTitle(search: string) {
        try {
            const Beyblade = await this.getVariantModel();
            const regex = new RegExp(search, "i");
            const docs = await Beyblade.find({
                $or: [{ productCode: regex }, { title: regex }],
            }).lean<IBeybladeProduct[]>();
            return docs;
        } catch (err) {
            console.error("searchBeybladeByProductCodeOrTitle error:", err);
            return [];
        }
    }

    async getBeybladeByProductCode(productCode: string): Promise<IBeybladeProduct | null> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.findOne({ productCode }).lean<IBeybladeProduct>();
            return doc;
        } catch (err) {
            console.error("getBeybladeByProductCode error:", err);
            return null;
        }
    }
}

export const beybladeController = (generation: TBeybladeGeneration) => new BeybladeController(generation);
