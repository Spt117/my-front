"use server";

import { amazonService, IAmazonRecord } from "@/library/pocketbase/AmazonService";

export async function createMarketplace(data: IAmazonRecord) {
    try {
        await amazonService.create(data);
        return { message: "Marketplace créé avec succès" };
    } catch (error) {
        console.error("Erreur création marketplace:", error);
        return { error: "Erreur lors de la création du marketplace" };
    }
}

export async function toggleMarketplaceActive(id: string, isActive: boolean) {
    try {
        await amazonService.setActive(id, isActive);
        return { message: `Marketplace ${isActive ? "activé" : "désactivé"}` };
    } catch (error) {
        console.error("Erreur toggle marketplace:", error);
        return { error: "Erreur lors de la modification du statut" };
    }
}
