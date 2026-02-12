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
