import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { TDomainsShopify } from "../../../params/paramsShopify";
import { TVariant, VariantSchema } from "./Variant";

class ControllerVariant {
    domain: TDomainsShopify;

    constructor(domain: TDomainsShopify) {
        this.domain = domain;
    }

    /**
     * Récupère le modèle Mongoose de l'utilisateur.
     */
    private async getVariantModel(): Promise<Model<TVariant>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Shopify");

        const modelName = "variant";
        const collectionName = `${this.domain}_variants`;

        const existingModel = connection.models[modelName];
        if (existingModel) return existingModel as Model<TVariant>;

        const variantModel = connection.model<TVariant>(modelName, VariantSchema, collectionName);
        return variantModel;
    }

    async updateSkuById(id: string, sku: string) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.updateOne({ idVariant: id }, { $set: { sku: sku } });
            return doc;
        } catch (err) {
            console.error("updateSkuById error:", err);
            return null;
        }
    }

    async getVariantBySku(sku: string) {
        try {
            const Variant = await this.getVariantModel();
            const res = await Variant.findOne({ sku }).lean<TVariant>();
            return JSON.parse(JSON.stringify(res)) as TVariant | null;
        } catch (err) {
            console.error("getVariantBySku error:", err);
            return null;
        }
    }

    async updateQuantityBySku(sku: string, quantity: number) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.findOneAndUpdate({ sku }, { $set: { quantity: quantity } }, { new: true }).lean<TVariant>();
            return doc;
        } catch (err) {
            console.error("updateQuantityBySku error:", err);
            return null;
        }
    }

    async createVariant(payload: TVariant) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.create(payload);
            return JSON.parse(JSON.stringify(doc)) as TVariant;
        } catch (err) {
            console.error("createVariant error:", err);
            return null;
        }
    }

    async updateVariantBySku(sku: string, updates: Partial<Pick<TVariant, "price" | "compareAtPrice">>) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.findOneAndUpdate({ sku }, { $set: updates }, { new: true }).lean<TVariant>();
            return doc;
        } catch (err) {
            console.error("updateVariantBySku error:", err);
            return null;
        }
    }

    async upsertVariantBySku(payload: TVariant) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.findOneAndUpdate(
                { sku: payload.sku },
                {
                    $set: {
                        price: payload.price,
                        compareAtPrice: payload.compareAtPrice,
                        barcode: payload.barcode,
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            ).lean<TVariant>();
            return doc;
        } catch (err) {
            console.error("upsertVariantBySku error:", err);
            return null;
        }
    }

    async rebuyBySku(sku: string, rebuy: boolean) {
        try {
            const Variant = await this.getVariantModel();
            const res = await Variant.updateOne({ sku }, { $set: { rebuy: rebuy } });
            return res;
        } catch (err) {
            console.error("activeRebuyBySku error:", err);
        }
    }
    async rebuyLaterBySku(sku: string, rebuyLater: boolean) {
        try {
            const Variant = await this.getVariantModel();
            const res = await Variant.updateOne({ sku }, { $set: { rebuyLater: rebuyLater } });
            return res;
        } catch (err) {
            console.error("activeRebuyLaterBySku error:", err);
        }
    }

    async getVariantById(id: string) {
        try {
            const Variant = await this.getVariantModel();
            return (await Variant.findById(id).lean<TVariant>()) ?? null;
        } catch (err) {
            console.error("getVariantById error:", err);
            return null;
        }
    }

    async getVariantRebuy(): Promise<TVariant[]> {
        try {
            const Variant = await this.getVariantModel();
            const data = await Variant.find({ $or: [{ rebuy: true }, { rebuyLater: true }] }).lean<TVariant[]>();
            return JSON.parse(JSON.stringify(data));
        } catch (err) {
            console.error("getVariantRebuy error:", err);
            return [];
        }
    }

    async boughtBySku(sku: string, bought: boolean): Promise<Boolean> {
        try {
            console.log("updating bought status... " + sku + " to " + bought);

            const Variant = await this.getVariantModel();
            const res = await Variant.findOneAndUpdate({ sku }, { $set: { bought: bought } });
            return res ? true : false;
        } catch (err) {
            console.error("activeBoughtBySku error:", err);
            return false;
        }
    }

    async activeAffiliate(sku: string, active: boolean): Promise<Boolean> {
        try {
            console.log("updating activeAffiliate status... " + sku + " to " + active);
            const Variant = await this.getVariantModel();
            const res = await Variant.findOneAndUpdate({ sku }, { $set: { activeAffiliate: active } });
            return res ? true : false;
        } catch (err) {
            console.error("activeAffiliate error:", err);
            return false;
        }
    }
}

export const variantController = (domain: TDomainsShopify) => new ControllerVariant(domain);
