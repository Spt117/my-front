"use server";

import { supabase } from "@/library/supabase/client";
import { revalidatePath } from "next/cache";
import { CountryCode } from "@/library/utils/amazon";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { BeybladeProduct, BeybladeProductType } from "./supabase/beyblade";
import { beybladeService } from "./supabase/beyblade-service";
import { shopifyPublicationService, IShopifyPublicationRecordFull } from "@/library/pocketbase/ShopifyPublicationService";

interface AsinInput {
    marketplace: CountryCode;
    asin: string;
    price: number;
}

export type AsinRecord = {
    id: number;
    asin: string;
    marketplace: string;
    price: number | null;
};

export type ShopifyPublicationWithContent = IShopifyPublicationRecordFull & {
    hasContent: boolean;
    beybladePackType?: BeybladeProductType | null;
    beybladeType?: string | null;
    supabaseAsins: AsinRecord[];
};

export async function getAmazonAffiliationPrice(asin: string, marketplace: string): Promise<{ price: number | null; error?: string }> {
    // marketplace est déjà le domain Amazon (ex: "amazon.fr")
    try {
        const result = await postServer(`${pokeUriServer}/amazon/price-by-marketplace`, { asin, marketplace });
        if (result.error) return { price: null, error: result.error };
        const price = result.response as number;
        if (!price || price <= 0) return { price: null, error: "Prix non disponible sur Amazon" };
        return { price };
    } catch (error) {
        console.error("Failed to fetch affiliation price:", error);
        return { price: null, error: "Erreur lors de la récupération du prix" };
    }
}

export async function createBeybladeOnShop(params: {
    publicationId: string;
    sku: string;
    shop: string;
    price: string;
    tags: string[];
}): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await postServer(`${pokeUriServer}/shopify/create-beyblade-product`, params);
        if (result.error) return { success: false, error: result.error };
        return { success: true };
    } catch (error) {
        console.error("Failed to create beyblade product on shop:", error);
        return { success: false, error: JSON.stringify(error) };
    }
}

export async function getBeybladePublications(): Promise<ShopifyPublicationWithContent[]> {
    try {
        const all = await shopifyPublicationService.getAll();
        const beyblade = all.filter((p) => p.produit === "beyblade");

        if (beyblade.length === 0) return [];

        const uniqueSkus = [...new Set(beyblade.map((p) => p.sku).filter(Boolean))];
        const skusWithContent = new Set<string>();
        const productInfoBySku: Record<string, { packType: BeybladeProductType | null; beybladeType: string | null }> = {};

        if (uniqueSkus.length > 0) {
            // 1. Vérifier quels SKUs ont du contenu dans product_content
            const { data: contentRows } = await supabase
                .from("product_content")
                .select("product_code")
                .in("product_code", uniqueSkus);

            for (const row of contentRows || []) {
                if (row.product_code) skusWithContent.add(row.product_code);
            }

            // 2. Récupérer le type de pack (Booster/Starter/etc.) depuis x_products
            const { data: productsData } = await supabase
                .from("x_products")
                .select("id, sku, product")
                .in("sku", uniqueSkus);

            // 3. Récupérer le premier combo (type Attack/Defense/Stamina/Balance) par SKU
            const { data: comboContentRows } = await supabase
                .from("product_content")
                .select("product_code, content_id")
                .in("product_code", uniqueSkus)
                .eq("content_type", "combo")
                .order("display_order", { ascending: true });

            const skuToComboId: Record<string, string> = {};
            for (const row of comboContentRows || []) {
                if (row.product_code && row.content_id && !skuToComboId[row.product_code]) {
                    skuToComboId[row.product_code] = row.content_id;
                }
            }

            const uniqueComboIds = [...new Set(Object.values(skuToComboId))];
            const comboTypeById: Record<string, string> = {};
            if (uniqueComboIds.length > 0) {
                const { data: combosData } = await supabase
                    .from("x_combos")
                    .select("id, type")
                    .in("id", uniqueComboIds);

                for (const combo of combosData || []) {
                    if (combo.id && combo.type) comboTypeById[combo.id] = combo.type;
                }
            }

            for (const sku of uniqueSkus) {
                const productInfo = (productsData || []).find((p) => p.sku === sku);
                const comboId = skuToComboId[sku];
                productInfoBySku[sku] = {
                    packType: (productInfo?.product as BeybladeProductType) ?? null,
                    beybladeType: comboId ? (comboTypeById[comboId] ?? null) : null,
                };
            }

            // 4. Récupérer les ASINs depuis Supabase
            const skuToProductId: Record<string, string> = {};
            for (const p of productsData || []) {
                if (p.sku && p.id) skuToProductId[p.sku] = p.id;
            }

            const productIds = Object.values(skuToProductId);
            const asinsByProductId: Record<string, AsinRecord[]> = {};

            if (productIds.length > 0) {
                const { data: asinsData } = await supabase
                    .from("asins")
                    .select("id, product_id, asin, marketplace, price")
                    .in("product_id", productIds);

                for (const row of asinsData || []) {
                    if (row.product_id) {
                        if (!asinsByProductId[row.product_id]) asinsByProductId[row.product_id] = [];
                        asinsByProductId[row.product_id].push({
                            id: row.id,
                            asin: row.asin,
                            marketplace: row.marketplace,
                            price: row.price ?? null,
                        });
                    }
                }
            }

            return beyblade.map((pub) => ({
                ...pub,
                hasContent: skusWithContent.has(pub.sku),
                beybladePackType: productInfoBySku[pub.sku]?.packType ?? null,
                beybladeType: productInfoBySku[pub.sku]?.beybladeType ?? null,
                supabaseAsins: asinsByProductId[skuToProductId[pub.sku] ?? ""] ?? [],
            }));
        }

        return beyblade.map((pub) => ({
            ...pub,
            hasContent: skusWithContent.has(pub.sku),
            beybladePackType: productInfoBySku[pub.sku]?.packType ?? null,
            beybladeType: productInfoBySku[pub.sku]?.beybladeType ?? null,
            supabaseAsins: [],
        }));
    } catch (error) {
        console.error("Failed to fetch beyblade publications:", error);
        return [];
    }
}

export async function updateAsinPrice(asinId: number, price: number): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from("asins")
            .update({ price, updated_at: new Date().toISOString() })
            .eq("id", asinId);
        if (error) throw error;

        // Récupérer le slug du produit pour revalider la page beycommunity.com
        const { data: asinRow } = await supabase
            .from("asins")
            .select("product_id")
            .eq("id", asinId)
            .single();

        if (asinRow?.product_id) {
            const { data: product } = await supabase
                .from("x_products")
                .select("slug")
                .eq("id", asinRow.product_id)
                .single();

            if (product?.slug) {
                const beycommunityUrl = process.env.BEYCOMMUNITY_URL ?? "https://beycommunity.com";
                const token = process.env.BEYCOMMUNITY_REVALIDATE_TOKEN ?? "";
                await fetch(`${beycommunityUrl}/api/revalidate?secret=${token}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ table: "asins", slug: product.slug }),
                }).catch((err) => console.error("Failed to revalidate beycommunity:", err));
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update ASIN price:", error);
        return { success: false, error: JSON.stringify(error) };
    }
}

export async function checkSkuExists(sku: string): Promise<boolean> {
    const { data, error } = await supabase.from("x_products").select("id").eq("sku", sku.trim()).maybeSingle();
    if (error) return false;
    return !!data;
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
        const { id, created_at, updated_at, ...insertData } = data as any;

        // S'assurer que les champs obligatoires sont présents
        if (!insertData.slug) {
            insertData.slug = insertData.title
                ?.toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
        }

        const { data: newRecord, error } = await supabase.from("x_products").insert({ id: crypto.randomUUID(), ...insertData }).select().single();

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
            productCode: insertData.sku,
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
