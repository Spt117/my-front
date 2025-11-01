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
        const collectionName = `beyblade_product_${this.generation}`;

        const existingModel = connection.models[modelName];
        if (existingModel) return existingModel as Model<IBeybladeProduct>;
        const Beyblade = connection.model<IBeybladeProduct>(modelName, BeybladeSchema, collectionName);
        return Beyblade;
    }

    async createBeyblade(payload: IBeybladeProduct): Promise<{ response: any; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.create(payload);
            return { response: JSON.parse(JSON.stringify(doc)), message: "Beyblade created successfully." };
        } catch (err) {
            return { response: err, error: "Beyblade creation failed." };
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

    async getBeybladeWithoutProductType(): Promise<IBeybladeProduct[]> {
        try {
            const Beyblade = await this.getVariantModel();
            const docs = await Beyblade.find({
                product: null,
            }).lean<IBeybladeProduct[]>();
            return JSON.parse(JSON.stringify(docs));
        } catch (err) {
            console.error("getBeybladeWithoutProductType error:", err);
            return [];
        }
    }

    async getBeybladeWithEmptyContent(): Promise<IBeybladeProduct[]> {
        try {
            const Beyblade = await this.getVariantModel();
            const docs = await Beyblade.find({
                $or: [{ content: { $exists: false } }, { content: { $size: 0 } }],
            }).lean<IBeybladeProduct[]>();
            return JSON.parse(JSON.stringify(docs));
        } catch (err) {
            console.error("getBeybladeWithEmptyContent error:", err);
            return [];
        }
    }

    async getBeybladeWithContentToReview(): Promise<IBeybladeProduct[]> {
        try {
            const Beyblade = await this.getVariantModel();
            const docs = await Beyblade.find({
                "content.toReview": true,
            }).lean<IBeybladeProduct[]>();
            return JSON.parse(JSON.stringify(docs));
        } catch (err) {
            console.error("getBeybladeWithContentToReview error:", err);
            return [];
        }
    }

    async deleteById(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();
            const result = await Beyblade.findByIdAndDelete(id);
            if (result) {
                return { success: true, message: "Beyblade deleted successfully." };
            } else {
                return { success: false, error: "Beyblade not found." };
            }
        } catch (err) {
            return { success: false, error: "Beyblade deletion failed." };
        }
    }
}

export const beybladeController = (generation: TBeybladeGeneration) => new BeybladeController(generation);
