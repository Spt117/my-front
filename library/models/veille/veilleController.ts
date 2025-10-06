import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { createVeilleSchema, TVeille } from "./veilleType";

class ControllerVeilleProduct {
    /**
     * Récupère le modèle de produit de veille.
     */
    private async getModelVeilleProduct(): Promise<Model<TVeille>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Price-Alert");
        const collectionName = `veille_products`;
        if (connection.models[collectionName]) return connection.models[collectionName];
        const schema = createVeilleSchema(collectionName);
        return connection.model(collectionName, schema);
    }

    /**
     * Récupère les produits de veille par utilisateur.
     * @param userId - ID de l'utilisateur.
     * @returns Liste des produits de veille
     */
    async getVeillesByUser(): Promise<TVeille[]> {
        try {
            const VeilleProductModel = await this.getModelVeilleProduct();
            const products = await VeilleProductModel.find({ user: "68b1ddae9f2560d5e49fb30c" });
            return JSON.parse(JSON.stringify(products));
        } catch (error) {
            console.error("Erreur getVeillesByUser:", error);
            return [];
        }
    }

    async addWebsiteToVeille(veilleId: string, website: string[]): Promise<TVeille | null> {
        try {
            const VeilleProductModel = await this.getModelVeilleProduct();
            const updatedVeille = await VeilleProductModel.findByIdAndUpdate(veilleId, { $set: { website } }, { new: true });
            return updatedVeille ? JSON.parse(JSON.stringify(updatedVeille)) : null;
        } catch (error) {
            console.error("Erreur addWebsiteToVeille:", error);
            return null;
        }
    }

    static getInstance(): ControllerVeilleProduct {
        return new ControllerVeilleProduct();
    }
}

export const veilleController = () => ControllerVeilleProduct.getInstance();
