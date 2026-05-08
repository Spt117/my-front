"use server";

import { everwishProductService, IEverwishProductRecordFull } from "@/library/pocketbase/EverwishProductService";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { revalidatePath } from "next/cache";

export type EverwishProduct = IEverwishProductRecordFull;

export async function listEverwishProducts(): Promise<EverwishProduct[]> {
    try {
        return await everwishProductService.getAll();
    } catch (error) {
        console.error("Erreur récupération produits Ever Wish:", error);
        return [];
    }
}

export async function triggerEverwishScan(): Promise<{ success: boolean; message?: string; error?: string }> {
    const result = await postServer(`${pokeUriServer}/everwish/scan`, {});
    if (result.error) return { success: false, error: result.error };
    revalidatePath("/ever-wish");
    return { success: true, message: result.message };
}

export async function addEverwishUrl(url: string): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/everwish/add-url`, { url });
    if (result.error) return { success: false, error: result.error };
    revalidatePath("/ever-wish");
    return { success: true };
}

export async function toggleEverwishAlert(
    id: string,
    field: "alertRestock" | "alertOutOfStock",
    value: boolean,
): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/everwish/products/${id}`, { [field]: value });
    if (result.error) return { success: false, error: result.error };
    revalidatePath("/ever-wish");
    return { success: true };
}

export async function deleteEverwishProduct(id: string): Promise<{ success: boolean; error?: string }> {
    // PATCH/DELETE non gérés par postServer ; on appelle fetch directement avec auth.
    try {
        const response = await fetch(`${pokeUriServer}/everwish/products/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.URI_SERVER_ACCES}`,
            },
        });
        const json = await response.json();
        if (json.error) return { success: false, error: json.error };
        revalidatePath("/ever-wish");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Erreur réseau" };
    }
}
