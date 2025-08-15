import { getMongoConnectionManager } from "@/library/auth/connector";
import mongoose, { Model } from "mongoose";
import { Asin, TAsin, TMarketPlace } from "./asin";

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
     * Crée un nouvel ASIN.
     */
    public async createASin(data: TAsin): Promise<TAsin | null> {
        const exist = await this.checkASinExists(data.asin);
        if (exist) {
            console.error(`ASIN already exists: ${data.asin}`);
            return null;
        }
        const AsinModel = await this.getASinModel();
        const asin = new AsinModel(data);
        try {
            return await asin.save();
        } catch (error) {
            console.error(`Error creating ASIN: ${error}`);
            return null;
        }
    }

    public async getASins(): Promise<TAsin[]> {
        const AsinModel = await this.getASinModel();
        try {
            return await AsinModel.find().exec();
        } catch (error) {
            console.error(`Error fetching ASINs: ${error}`);
            return [];
        }
    }

    /**
     * Vérifie si un ASIN existe dans la base de données.
     */
    public async checkASinExists(asin: string): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        if (!asin) {
            console.error("Invalid parameter: asin is required");
            return false;
        }

        try {
            const count = await AsinModel.countDocuments({ asin }).exec();
            return count > 0;
        } catch (error) {
            console.error(`Error checking ASIN existence: ${error}`);
            return false;
        }
    }

    /**
     * Vérifie si une marketplace existe dans l'array alerte d'un ASIN.
     * Si elle n'existe pas, l'ajoute à l'array.
     */
    public async checkAndAddMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return false;
        }

        try {
            // Vérifier si la marketplace existe déjà
            const existingDoc = await AsinModel.findOne({
                asin,
                "alerte.marketPlace": marketPlace,
            }).exec();

            // Si la marketplace existe déjà, retourner true
            if (existingDoc) {
                return true;
            }

            // Sinon, ajouter la marketplace à l'array alerte
            const result = await AsinModel.updateOne(
                { asin },
                {
                    $push: {
                        alerte: {
                            marketPlace,
                            endOfAlerte: false,
                        },
                    },
                }
            ).exec();

            return result.modifiedCount > 0;
        } catch (error) {
            console.error(`Error checking/adding marketplace: ${error}`);
            return false;
        }
    }

    public async disableASinByMarketPlace(asin: string, marketPlace: TMarketPlace): Promise<boolean> {
        const AsinModel = await this.getASinModel();

        // Validation des paramètres
        if (!asin || !marketPlace) {
            console.error("Invalid parameters: asin and marketPlace are required");
            return false;
        }

        try {
            const result = await AsinModel.updateOne(
                { asin },
                { "alerte.$[elem].endOfAlerte": true },
                {
                    arrayFilters: [{ "elem.marketPlace": marketPlace }],
                }
            ).exec();

            // Vérifier si un document a été modifié ET si au moins un élément a été mis à jour
            return result.matchedCount > 0 && result.modifiedCount > 0;
        } catch (error) {
            console.error(`Error disabling ASIN: ${error}`);
            return false;
        }
    }
}

export const asinController = new ControllerAsin();
