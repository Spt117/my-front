"use server";

import { boolean } from "zod";
import { asinController } from "./asinController";
import { TALerteMarketPlace, TAsin, TMarketPlace } from "./asinType";
import { authOptions } from "@/library/auth/authOption";
import { getServerSession } from "next-auth";

/**
 * Action serveur pour créer un nouvel ASIN
 */
export async function createAsinAction(asin: string, marketPlace: TMarketPlace): Promise<{ success: boolean; data?: TAsin; error?: string }> {
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
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };
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
export async function acitveAsinByMarketPlaceAction(asin: string, marketPlace: TALerteMarketPlace): Promise<{ success: boolean; error?: string }> {
    try {
        // Validation côté serveur
        if (!asin || !marketPlace) {
            return { success: false, error: "ID and marketplace are required" };
        }

        let result;
        if (marketPlace.active) result = await asinController.disableASinByMarketPlace(asin, marketPlace.marketPlace);
        else result = await asinController.enableASinByMarketPlace(asin, marketPlace.marketPlace);

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
 * Action serveur pour désactiver une marketplace d'un ASIN
 * @param asin - L'ASIN à modifier
 * @param marketPlace - La marketplace pour laquelle désactiver l'ASIN
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
