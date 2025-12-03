"use server";

import { asinController } from "./asinController";
import { TAsin, TMarketPlace, TTypeOfProduct } from "./asinType";

/**
 * Action serveur pour créer un nouvel ASIN
 */
export async function createAsinAction(asin: string, marketPlace: TMarketPlace, typeOfProduct: TTypeOfProduct): Promise<{ success: boolean; data?: TAsin; error?: string }> {
    try {
        const result = await asinController.createASin(asin, marketPlace, typeOfProduct);

        if (result) {
            return { success: true, data: JSON.parse(JSON.stringify(result)) };
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
 * Action serveur pour récupérer un ASIN par marketplace
 */
export async function getAsinByMarketPlaceAction(asin: string, marketPlace: TMarketPlace): Promise<{ success: boolean; data?: TAsin | null; error?: string }> {
    try {
        const result = await asinController.getAsinByMarketPlace(asin, marketPlace);
        return { success: true, data: result };
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour mettre à jour un ASIN
 */
export async function updateAsinAction(asinID: string, marketPlace: TMarketPlace, updateData: Partial<TAsin>): Promise<{ success: boolean; data?: TAsin | null; error?: string }> {
    // Validation côté serveur
    if (!asinID || !marketPlace) {
        return { success: false, error: "asin and marketPlace are required" };
    }

    try {
        const result = await asinController.updateAsin(asinID, marketPlace, updateData);

        if (result) {
            return { success: true, data: result };
        } else {
            return { success: false, error: "ASIN not found" };
        }
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour supprimer un ASIN
 */
export async function deleteAsinAction(asin: string, marketPlace: TMarketPlace): Promise<{ success: boolean; error?: string }> {
    // Validation côté serveur
    if (!asin || !marketPlace) {
        return { success: false, error: "asin and marketPlace are required" };
    }

    try {
        const result = await asinController.deleteAsin(asin, marketPlace);

        if (result) {
            return { success: true };
        } else {
            return { success: false, error: "ASIN not found" };
        }
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

/**
 * Action serveur pour vérifier si un ASIN existe
 */
export async function checkAsinExistsAction(asin: string, marketPlace: TMarketPlace): Promise<{ success: boolean; exists: boolean; data?: TAsin | null; error?: string }> {
    // Validation côté serveur
    if (!asin || !marketPlace) {
        return { success: false, exists: false, error: "asin and marketPlace are required" };
    }

    try {
        const result = await asinController.checkASinExists(asin, marketPlace);

        return {
            success: true,
            exists: result !== null,
            data: result,
        };
    } catch (error) {
        console.error("Server action error:", error);
        return { success: false, exists: false, error: "Internal server error" };
    }
}
