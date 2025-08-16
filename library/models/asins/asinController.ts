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
    public async createASin(data: TAsin): Promise<TAsin | null> {
        if (!data.asin) {
            console.error("Invalid data: asin is required");
            return null;
        }

        try {
            const AsinModel = await this.getASinModel();

            // Vérifier si l'ASIN existe déjà
            const existingAsin = await AsinModel.findOne({ asin: data.asin }).exec();

            if (existingAsin) {
                console.log(`ASIN ${data.asin} already exists, updating marketplaces...`);

                // Si l'ASIN existe, ajouter la marketplace si elle n'existe pas
                if (data.alerte && data.alerte.length > 0) {
                    let hasUpdated = false;

                    for (const alert of data.alerte) {
                        // Vérifier si cette marketplace existe déjà
                        const marketplaceExists = existingAsin.alerte?.some((existingAlert) => existingAlert.marketPlace === alert.marketPlace);

                        if (!marketplaceExists) {
                            await AsinModel.updateOne(
                                { asin: data.asin },
                                {
                                    $push: {
                                        alerte: {
                                            marketPlace: alert.marketPlace,
                                            endOfAlerte: false,
                                        },
                                    },
                                }
                            ).exec();
                            hasUpdated = true;
                        }
                    }

                    if (hasUpdated) {
                        // Retourner l'ASIN mis à jour avec .lean() pour éviter les références circulaires
                        return await AsinModel.findOne({ asin: data.asin }).lean().exec();
                    }
                }

                // Retourner l'ASIN existant sans modification avec .lean()
                return existingAsin.toObject();
            } else {
                // Si l'ASIN n'existe pas, le créer
                console.log(`Creating new ASIN: ${data.asin}`);
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
                console.log(`Marketplace ${marketPlace} already exists for ASIN ${asin}`);
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

            const success = result.modifiedCount > 0;
            console.log(`Added marketplace ${marketPlace} to ASIN ${asin}: ${success}`);
            return success;
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
            const success = result.matchedCount > 0 && result.modifiedCount > 0;
            console.log(`Disabled ASIN ${asin} for marketplace ${marketPlace}: ${success}`);
            return success;
        } catch (error) {
            console.error(`Error disabling ASIN: ${error}`);
            return false;
        }
    }
}

export const asinController = new ControllerAsin();
