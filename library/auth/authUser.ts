"use server";

import { getMongoConnectionManager } from "./connector";
// Créer une fonction spécifique pour votre cas d'usage
export async function getClientNextAuth() {
    const manager = await getMongoConnectionManager();
    return manager.getClientOnly();
}
