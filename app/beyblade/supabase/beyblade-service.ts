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
     * Fetch a single product by ID
     */
    async getOne(id: string): Promise<BeybladeProduct | null> {
        const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

        if (error) {
            console.log(`Error fetching beyblade product ${id}:`, error);
            return null;
        }

        if (!data) return null;

        return {
            ...data,
            id: data.id?.toString(),
            created: data.created_at,
            updated: data.updated_at,
            collectionId: "",
            collectionName: "",
        } as BeybladeProduct;
    }

    /**
     * Fetch a single product by slug
     */
    async getOneBySlug(slug: string): Promise<BeybladeProduct | null> {
        const { data, error } = await supabase.from(this.tableName).select("*").eq("slug", slug).single();

        if (error) {
            console.log(`Error fetching beyblade product with slug "${slug}":`, error);
            return null;
        }

        if (!data) return null;

        return {
            ...data,
            id: data.id?.toString(),
            created: data.created_at,
            updated: data.updated_at,
            collectionId: "",
            collectionName: "",
        } as BeybladeProduct;
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

    /**
     * Get adjacent products (previous and next) based on list order
     * Uses the same ordering as getFullList (created_at DESC)
     */
    async getAdjacentProducts(currentIdOrSlug: string): Promise<{ prev: { id: string; slug: string; title: string } | null; next: { id: string; slug: string; title: string } | null }> {
        // Get the full list in the same order as displayed
        const { data: allProducts, error } = await supabase
            .from(this.tableName)
            .select("id, slug, title")
            .order("created_at", { ascending: false });

        if (error || !allProducts || allProducts.length === 0) {
            return { prev: null, next: null };
        }

        // Find current product index
        const currentIndex = allProducts.findIndex(
            (p) => p.id.toString() === currentIdOrSlug || p.slug === currentIdOrSlug
        );

        if (currentIndex === -1) {
            return { prev: null, next: null };
        }

        // Previous = the one BEFORE in the list (index - 1)
        const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
        
        // Next = the one AFTER in the list (index + 1)
        const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

        return {
            prev: prevProduct ? { id: prevProduct.id.toString(), slug: prevProduct.slug, title: prevProduct.title } : null,
            next: nextProduct ? { id: nextProduct.id.toString(), slug: nextProduct.slug, title: nextProduct.title } : null,
        };
    }
}


export const beybladeService = new BeybladeSupabaseService();

