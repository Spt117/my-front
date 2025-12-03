import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { TAsin, TMarketPlace, TTypeOfProduct } from "./asinType";
import { Asin } from "./asin";

class ControllerAsin {
    /**
     * Récupère le modèle Mongoose de l'ASIN.
     */
    private async getASinModel(): Promise<Model<TAsin>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("datas");
        return connection.model<TAsin>("asin", Asin.schema);
    }

    /**
     * Crée un nouvel ASIN.
     */
    public async createASin(asinID: string, marketPlace: TMarketPlace, typeOfProduct: TTypeOfProduct) {
        try {
            const AsinModel = await this.getASinModel();

            // Vérifier si l'ASIN existe déjà
            const existingAsin = await this.checkASinExists(asinID, marketPlace);

            if (existingAsin) {
                return existingAsin;
            }

            // Si l'ASIN n'existe pas, le créer
            const data: TAsin = {
                asin: asinID,
                marketPlace,
                typeOfProduct,
            };
            const asin = new AsinModel(data);
            const saved = await asin.save();

            // Retourner l'objet plain pour éviter les références circulaires
            return saved.toObject();
        } catch (error) {
            console.error(`Error creating ASIN: ${error}`);
            return null;
        }
    }

    /**
     * Récupère un ASIN par son ID et sa marketplace.
     */
    public async getAsinByMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<TAsin | null> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return null;
        }

        try {
            const result = await AsinModel.findOne({ asin, marketPlace }).lean().exec();
            return result ? JSON.parse(JSON.stringify(result)) : null;
        } catch (error) {
            console.error(`Error fetching ASIN by marketplace: ${error}`);
            return null;
        }
    }

    /**
     * Récupère tous les ASINs.
     */
    public async getASins(): Promise<TAsin[]> {
        const AsinModel = await this.getASinModel();
        try {
            const result = await AsinModel.find().lean().exec();
            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            console.error(`Error fetching ASINs: ${error}`);
            return [];
        }
    }

    /**
     * Vérifie si un ASIN existe dans la base de données.
     */
    public async checkASinExists(asin: string, marketPlace: TMarketPlace): Promise<TAsin | null> {
        const AsinModel = await this.getASinModel();

        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return null;
        }

        try {
            const result = await AsinModel.findOne({ asin, marketPlace }).lean().exec();
            return result ? JSON.parse(JSON.stringify(result)) : null;
        } catch (error) {
            console.error(`Error checking ASIN existence: ${error}`);
            return null;
        }
    }

    /**
     * Met à jour un ASIN existant.
     */
    public async updateAsin(asinID: string, marketPlace: TMarketPlace, updateData: Partial<TAsin>): Promise<TAsin | null> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asinID || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return null;
        }

        try {
            const result = await AsinModel.findOneAndUpdate({ asin: asinID, marketPlace }, updateData, { new: true }).lean().exec();
            return result ? JSON.parse(JSON.stringify(result)) : null;
        } catch (error) {
            console.error(`Error updating ASIN: ${error}`);
            return null;
        }
    }

    /**
     * Supprime un ASIN.
     */
    public async deleteAsin(asinID: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asinID || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return false;
        }

        try {
            const result = await AsinModel.deleteOne({ asin: asinID, marketPlace }).exec();
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error deleting ASIN: ${error}`);
            return false;
        }
    }
}

export const asinController = new ControllerAsin();
