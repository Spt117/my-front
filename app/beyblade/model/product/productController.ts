import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { IBeybladeProduct, IProductContentItem, TBeybladeGeneration } from "../typesBeyblade";
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

    async updateBeybladeById(id: string, payload: Partial<IBeybladeProduct>): Promise<{ response: any; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true }).lean<IBeybladeProduct>();

            if (!doc) {
                return { response: null, error: "Beyblade not found." };
            }

            return { response: JSON.parse(JSON.stringify(doc)), message: "Beyblade updated successfully." };
        } catch (err) {
            return { response: err, error: "Beyblade update failed." };
        }
    }

    async updateBeybladeField(id: string, field: keyof IBeybladeProduct, value: any): Promise<{ response: any; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.findByIdAndUpdate(id, { $set: { [field]: value } }, { new: true, runValidators: true }).lean<IBeybladeProduct>();

            if (!doc) {
                return { response: null, error: "Beyblade not found." };
            }

            return { response: JSON.parse(JSON.stringify(doc)), message: `Field ${String(field)} updated successfully.` };
        } catch (err) {
            return { response: err, error: `Field ${String(field)} update failed.` };
        }
    }

    async updateContentItem(id: string, contentIndex: number, updates: Partial<IProductContentItem>): Promise<{ response: any; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();

            // Construction dynamique de l'objet de mise à jour
            const updateObject: Record<string, any> = {};
            Object.entries(updates).forEach(([key, value]) => {
                updateObject[`content.${contentIndex}.${key}`] = value;
            });

            const doc = await Beyblade.findByIdAndUpdate(id, { $set: updateObject }, { new: true, runValidators: true }).lean<IBeybladeProduct>();

            if (!doc) {
                return { response: null, error: "Beyblade not found." };
            }

            return { response: JSON.parse(JSON.stringify(doc)), message: "Content item updated successfully." };
        } catch (err) {
            return { response: err, error: "Content item update failed." };
        }
    }

    async addContentItem(id: string, newItem: IProductContentItem): Promise<{ response: any; message?: string; error?: string }> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.findByIdAndUpdate(id, { $push: { content: newItem } }, { new: true, runValidators: true }).lean<IBeybladeProduct>();

            if (!doc) {
                return { response: null, error: "Beyblade not found." };
            }

            return { response: JSON.parse(JSON.stringify(doc)), message: "Content item added successfully." };
        } catch (err) {
            return { response: err, error: "Content item addition failed." };
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

    async getItemById(id: string): Promise<IBeybladeProduct | null> {
        try {
            const Beyblade = await this.getVariantModel();
            const doc = await Beyblade.findById(id).lean<IBeybladeProduct>();
            return JSON.parse(JSON.stringify(doc));
        } catch (err) {
            console.error("getItemById error:", err);
            return null;
        }
    }

    async getAllBeyblades(limit?: number): Promise<IBeybladeProduct[]> {
        try {
            const Beyblade = await this.getVariantModel();
            const query = Beyblade.find().sort({ createdAt: -1 });
            if (limit) query.limit(limit);
            const docs = await query.lean<IBeybladeProduct[]>();
            return JSON.parse(JSON.stringify(docs));
        } catch (err) {
            console.error("getAllBeyblades error:", err);
            return [];
        }
    }
}

export const beybladeController = (generation: TBeybladeGeneration) => new BeybladeController(generation);
