"use server";

import { supabase } from "@/library/supabase/client";
import { revalidatePath } from "next/cache";
import { CountryCode } from "@/library/utils/amazon";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { BeybladeProduct } from "./supabase/beyblade";
import { beybladeService } from "./supabase/beyblade-service";

interface AsinInput {
    marketplace: CountryCode;
    asin: string;
    price: number;
}

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

export async function createBeybladeProduct(data: Partial<BeybladeProduct>, asins?: AsinInput[]) {
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

        if (asins && asins.length > 0) {
            const asinRows = asins.map((a) => ({
                product_id: newRecord.id,
                asin: a.asin,
                marketplace: a.marketplace,
                price: a.price,
            }));

            const { error: asinError } = await supabase.from("asins").insert(asinRows);

            if (asinError) {
                console.error("Failed to insert ASINs", asinError);
                // On ne bloque pas la création du produit si les ASINs échouent
            }
        }

        // Vérification et mise en file d'attente sur les boutiques beyblade (fire-and-forget)
        postServer(`${pokeUriServer}/shopify/queue-beyblade-product`, {
            productCode: insertData.productCode,
            asins: asins?.map((a) => ({ marketplace: a.marketplace, asin: a.asin })) ?? [],
        }).then((result) => {
            if (result.error) console.error("Failed to queue beyblade product on shops:", result.error);
            else console.log("Beyblade shop queue result:", result.message);
        }).catch((err) => {
            console.error("Failed to reach Pokemon server for beyblade queue:", err);
        });

        revalidatePath("/beycommunity", "page");
        revalidatePath("/beyblade", "page");

        return { success: true, data: newRecord };
    } catch (error) {
        console.error("Failed to create product", error);
        return { success: false, error: JSON.stringify(error) };
    }
}
