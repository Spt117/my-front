"use server";

import { asinController } from "./asinController";
import { TAsin, TMarketPlace } from "./asinType";

/**
 * Action serveur pour créer un nouvel ASIN
 */
export async function createAsinAction(data: TAsin): Promise<{ success: boolean; data?: TAsin; error?: string }> {
    try {
        const result = await asinController.createASin(data);

        if (result) {
            return { success: true, data: JSON.parse(JSON.stringify(result)) }; // Utiliser JSON.parse pour éviter les références circulaires
        } else {
            return { success: false, error: "Failed to create ASIN" };
        }
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour récupérer tous les ASINs
 */
export async function getAsinsAction(): Promise<{ success: boolean; data?: TAsin[]; error?: string }> {
    try {
        const result = await asinController.getASins();
        return { success: true, data: result };
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour désactiver un ASIN par marketplace
 */
export async function disableAsinByMarketPlaceAction(asin: string, marketPlace: TMarketPlace): Promise<{ success: boolean; error?: string }> {
    try {
        // Validation côté serveur
        if (!asin || !marketPlace) {
            return { success: false, error: "ID and marketplace are required" };
        }

        const result = await asinController.disableASinByMarketPlace(asin, marketPlace);

        if (result) {
            return { success: true };
        } else {
            return { success: false, error: "ASIN not found or already disabled" };
        }
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour récupérer les ASINs actifs par marketplace
 */
export async function getActiveAsinsByMarketPlaceAction(marketPlace: TMarketPlace): Promise<{ success: boolean; data?: TAsin[]; error?: string }> {
    try {
        if (!marketPlace) {
            return { success: false, error: "Marketplace is required" };
        }

        const asins = await asinController.getASins();
        const activeAsins = asins.filter((asin) => asin.alerte.some((alert) => alert.marketPlace === marketPlace && !alert.endOfAlerte));

        return { success: true, data: activeAsins };
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour mettre à jour le titre d'un ASIN
 */
export async function updateAsinTitleAction(id: string, newTitle: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!id || !newTitle) {
            return { success: false, error: "ID and title are required" };
        }

        // Note: Il faudrait ajouter cette méthode au controller
        // Pour l'instant, on peut utiliser une approche directe
        const AsinModel = await asinController["getASinModel"]();
        const result = await AsinModel.updateOne({ _id: id }, { title: newTitle }).exec();

        if (result.matchedCount > 0) {
            return { success: true };
        } else {
            return { success: false, error: "ASIN not found" };
        }
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}
