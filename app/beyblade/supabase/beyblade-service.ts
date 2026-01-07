import { supabase } from "@/library/supabase/client";
import { BeybladeProduct } from "../pocketbase/types/beyblade";

class BeybladeSupabaseService {
    private readonly tableName = "x_products";

    /**
     * Fetch all products ordered by creation date
     */
    async getFullList(): Promise<BeybladeProduct[]> {
        const { data, error } = await supabase.from(this.tableName).select("*").order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching beyblade products from Supabase:", error);
            throw error;
        }

        // Map Supabase result to match BeybladeProduct interface
        return (data || []).map((item: any) => ({
            ...item,
            id: item.id?.toString(),
            created: item.created_at,
            updated: item.updated_at,
            // Default values for PocketBase specific fields to avoid breaking the UI
            collectionId: item.collectionId || "",
            collectionName: item.collectionName || "",
        })) as BeybladeProduct[];
    }

    /**
     * Update an existing product
     */
    async update(id: string, data: Partial<BeybladeProduct>): Promise<BeybladeProduct> {
        // Remove PocketBase specific fields and IDs from update data to prevent errors
        const { id: _id, created, updated, collectionId, collectionName, ...updateData } = data as any;

        const { data: updatedRecord, error } = await supabase.from(this.tableName).update(updateData).eq("id", id).select().single();

        if (error) {
            console.error(`Error updating beyblade product ${id}:`, error);
            throw error;
        }

        return {
            ...updatedRecord,
            id: updatedRecord.id.toString(),
            created: updatedRecord.created_at,
            updated: updatedRecord.updated_at,
            collectionId: "",
            collectionName: "",
        } as BeybladeProduct;
    }
}

export const beybladeService = new BeybladeSupabaseService();
