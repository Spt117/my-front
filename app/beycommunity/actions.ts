"use server";

import { supabase } from "@/library/supabase/client";
import { revalidatePath } from "next/cache";
import { BeybladeProduct } from "./supabase/beyblade";
import { beybladeService } from "./supabase/beyblade-service";

export async function updateBeybladeProduct(id: string, data: Partial<BeybladeProduct>) {
    try {
        await beybladeService.update(id, data);
        revalidatePath("/beyblade", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to update product", error);
        return { success: false, error: JSON.stringify(error) };
    }
}
export async function createBeybladeProduct(data: Partial<BeybladeProduct>) {
    try {
        const { id, created, updated, collectionId, collectionName, ...insertData } = data as any;

        // S'assurer que les champs obligatoires sont présents
        if (!insertData.slug) {
            insertData.slug = insertData.title
                ?.toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
        }

        const { data: newRecord, error } = await supabase.from("x_products").insert(insertData).select().single();

        if (error) throw error;

        revalidatePath("/beycommunity", "page");
        revalidatePath("/beyblade", "page");

        return { success: true, data: newRecord };
    } catch (error) {
        console.error("Failed to create product", error);
        return { success: false, error: JSON.stringify(error) };
    }
}
