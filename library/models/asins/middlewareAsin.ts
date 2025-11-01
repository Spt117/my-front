"use server";

import { asinController } from "./asinController";
import { TAsin, TMarketPlace } from "./asinType";

/**
 * Action serveur pour créer un nouvel ASIN
 */
export async function createAsinAction(
    asin: string,
    marketPlace: TMarketPlace
): Promise<{ success: boolean; data?: TAsin; error?: string }> {
    try {
        const result = await asinController.createASin(asin, marketPlace);

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
 * Action serveur pour désactiver une marketplace d'un ASIN
 * @param asin - L'ASIN à modifier
 * @param marketPlace - La marketplace pour laquelle activer l'ASIN
 */
export async function activeAsinByMarketPlaceAction(asin: TAsin): Promise<{ success: boolean; error?: string }> {
    // Validation côté serveur
    if (!asin) {
        return { success: false, error: "asin is required" };
    }

    try {
        const asinMarketPlace = await asinController.getAsinByMarketPlace(asin.asin, asin.marketPlace);
        if (!asinMarketPlace) {
            const result = await createAsinAction(asin.asin, asin.marketPlace);
            return result;
        }
        let result: boolean;
        // Si l'ASIN est déjà actif, on le désactive, sinon on l'active
        if (asinMarketPlace.active) result = await asinController.disableASinByMarketPlace(asin.asin, asin.marketPlace);
        else result = await asinController.enableASinByMarketPlace(asin.asin, asin.marketPlace);

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
