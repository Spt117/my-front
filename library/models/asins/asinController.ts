import { getMongoConnectionManager } from "@/library/auth/connector";
import { Model } from "mongoose";
import { TAsin, TMarketPlace } from "./asinType";
import { Asin } from "./asin";

class ControllerAsin {
    /**
     * Récupère le modèle Mongoose de l'utilisateur.
     */
    private async getASinModel(): Promise<Model<TAsin>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("datas");
        return connection.model<TAsin>("asin", Asin.schema);
    }

    /**
     * Crée un nouvel ASIN ou ajoute une marketplace si l'ASIN existe déjà.
     */
    public async createASin(asinID: string, marketPlace: TMarketPlace) {
        try {
            const AsinModel = await this.getASinModel();
            // Vérifier si l'ASIN existe déjà
            const existingAsin = await this.checkASinExists(asinID, marketPlace);

            if (existingAsin) {
                return;
            } else {
                // Si l'ASIN n'existe pas, le créer
                const data: TAsin = {
                    asin: asinID,
                    marketPlace,
                    active: true,
                };
                const asin = new AsinModel(data);
                const saved = await asin.save();

                // Retourner l'objet plain pour éviter les références circulaires
                return saved.toObject();
            }
        } catch (error) {
            console.error(`Error creating/updating ASIN: ${error}`);
            return null;
        }
    }

    public async getAsinByMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<TAsin | null> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return null;
        }

        try {
            const result = await AsinModel.findOne({ asin, marketPlace }).lean().exec();
            return result ? JSON.parse(JSON.stringify(result)) : null; // Utiliser JSON.parse pour éviter les références circulaires
        } catch (error) {
            console.error(`Error fetching ASIN by marketplace: ${error}`);
            return null;
        }
    }

    public async getASins(): Promise<TAsin[]> {
        const AsinModel = await this.getASinModel();
        try {
            const result = await AsinModel.find().lean().exec();
            return JSON.parse(JSON.stringify(result)); // Utiliser JSON.parse pour éviter les références circulaires
        } catch (error) {
            console.error(`Error fetching ASINs: ${error}`);
            return [];
        }
    }

    /**
     * Vérifie si un ASIN existe dans la base de données.
     */
    public async checkASinExists(asin: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        if (!asin) {
            console.error("Invalid parameter: asin is required");
            return false;
        }

        try {
            const count = await AsinModel.countDocuments({ asin, marketPlace }).exec();
            return count > 0;
        } catch (error) {
            console.error(`Error checking ASIN existence: ${error}`);
            return false;
        }
    }

    /**
     * Active un ASIN pour une marketplace spécifique.
     * @param asin L'ASIN à désactiver.
     * @param marketPlace La marketplace pour laquelle désactiver l'ASIN.
     * @returns true si la désactivation a réussi, false sinon.
     */
    public async enableASinByMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return false;
        }

        try {
            const result = await AsinModel.updateOne({ asin, marketPlace }, { active: true }).exec();
            // Vérifier si un document a été modifié ET si au moins un élément a été mis à jour
            const success = result.matchedCount > 0 && result.modifiedCount > 0;
            return success;
        } catch (error) {
            console.error(`Error disabling ASIN: ${error}`);
            return false;
        }
    }

    /**
     * Désactive un ASIN pour une marketplace spécifique.
     * @param asin L'ASIN à désactiver.
     * @param marketPlace La marketplace pour laquelle désactiver l'ASIN.
     * @returns true si la désactivation a réussi, false sinon.
     */
    public async disableASinByMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return false;
        }

        try {
            const result = await AsinModel.updateOne({ asin, marketPlace }, { active: false }).exec();
            // Vérifier si un document a été modifié ET si au moins un élément a été mis à jour
            const success = result.matchedCount > 0 && result.modifiedCount > 0;
            return success;
        } catch (error) {
            console.error(`Error disabling ASIN: ${error}`);
            return false;
        }
    }
}

export const asinController = new ControllerAsin();
