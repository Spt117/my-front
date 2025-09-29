import { Connection, Model } from "mongoose";
import { TVariant, VariantModel, VariantSchema } from "./Variant";
import { getMongoConnectionManager } from "@/library/auth/connector";

class ControllerVariant {
    /**
     * Récupère le modèle Mongoose de l'utilisateur.
     */
    async getVariantModelold(): Promise<Model<TVariant>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Pokemon");
        const Variant = connection.model<TVariant>("variants", VariantModel.schema);
        console.log({
            db: Variant.db.name,
            coll: Variant.collection.name,
            hasBought: !!Variant.schema.path("bought"),
            paths: Object.keys(Variant.schema.paths).slice(0, 10), // échantillon
        });
        return Variant;
    }

    /**
     * Récupère le modèle Mongoose de l'utilisateur.
     */

    private async getVariantModel(): Promise<Model<TVariant>> {
        const manager = await getMongoConnectionManager();
        const connection: Connection = await manager.getConnection("Pokemon");
        const name = "variant";
        const coll = "variants"; // <-- même nom que dans le schéma
        // Si déjà chargé sur cette connexion, vérifie que le schéma contient 'bought'.
        const existing = connection.models[name] as Model<TVariant> | undefined;

        if (existing) {
            const hasBought = !!existing.schema.path("bought");
            const rightColl = existing.collection?.name === coll;
            if (hasBought && rightColl) return existing;

            // modèle obsolète → le supprimer de CETTE connexion et recompiler
            if (typeof (connection as any).deleteModel === "function") {
                (connection as any).deleteModel(name);
            } else {
                // In recent Mongoose versions, models is readonly; fallback to deleteModel if available
                if (typeof connection.deleteModel === "function") {
                    connection.deleteModel(name);
                }
            }
        }

        // Compile proprement sur la connexion, en forçant la collection
        const Variant = connection.model<TVariant>(name, VariantSchema, coll);
        console.log("Recompiled model:", {
            db: Variant.db.name,
            coll: Variant.collection.name,
            hasBought: !!Variant.schema.path("bought"),
            paths: Object.keys(Variant.schema.paths).slice(0, 10), // échantillon
        });
        return Variant;
    }

    async createVariant(payload: TVariant) {
        try {
            const Variant = await this.getVariantModel();
            const doc = await Variant.create(payload);
            return doc;
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

    async getVariantBySku(sku: string) {
        try {
            const Variant = await this.getVariantModel();
            const v = await Variant.findOne({ sku }).lean<TVariant>();
            return JSON.parse(JSON.stringify(v)) as TVariant;
        } catch (err) {
            console.error("getVariantBySku error:", err);
            return null;
        }
    }

    async rebuyBySku(sku: string, rebuy: boolean): Promise<Boolean> {
        try {
            const Variant = await this.getVariantModel();
            const res = await Variant.findOneAndUpdate({ sku }, { $set: { rebuy: rebuy } });
            return res ? true : false;
        } catch (err) {
            console.error("activeRebuyBySku error:", err);
            return false;
        }
    }
    async rebuyLaterBySku(sku: string, rebuyLater: boolean): Promise<Boolean> {
        try {
            const Variant = await this.getVariantModel();
            const res = await Variant.updateOne({ sku }, { $set: { rebuyLater: rebuyLater } });
            return res ? true : false;
        } catch (err) {
            console.error("activeRebuyLaterBySku error:", err);
            return false;
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
            const data = await Variant.find({ $or: [{ rebuy: true }, { rebuyLater: true }, { bought: true }] }).lean<
                TVariant[]
            >();
            return JSON.parse(JSON.stringify(data));
        } catch (err) {
            console.error("getVariantRebuy error:", err);
            return [];
        }
    }
}

export const variantController = new ControllerVariant();
