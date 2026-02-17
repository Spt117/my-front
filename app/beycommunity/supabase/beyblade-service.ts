import { supabase } from "@/library/supabase/client";
import { BeybladeProduct } from "./beyblade";

class BeybladeSupabaseService {
    private readonly tableName = "x_products";

    async getFullList(): Promise<BeybladeProduct[]> {
        const { data, error } = await supabase.from(this.tableName).select("*").order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching beyblade products from Supabase:", error);
            throw error;
        }

        return (data || []) as BeybladeProduct[];
    }

    async getOne(id: string): Promise<BeybladeProduct | null> {
        const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

        if (error) {
            console.log(`Error fetching beyblade product ${id}:`, error);
            return null;
        }

        return data as BeybladeProduct | null;
    }

    async getOneBySlug(slug: string): Promise<BeybladeProduct | null> {
        const { data, error } = await supabase.from(this.tableName).select("*").eq("slug", slug).single();

        if (error) {
            console.log(`Error fetching beyblade product with slug "${slug}":`, error);
            return null;
        }

        return data as BeybladeProduct | null;
    }

    async update(id: string, data: Partial<BeybladeProduct>): Promise<BeybladeProduct> {
        const { id: _id, created_at, updated_at, ...updateData } = data as any;

        const { data: updatedRecord, error } = await supabase.from(this.tableName).update(updateData).eq("id", id).select().single();

        if (error) {
            console.error(`Error updating beyblade product ${id}:`, error);
            throw error;
        }

        return updatedRecord as BeybladeProduct;
    }

    async getAdjacentProducts(
        currentIdOrSlug: string,
    ): Promise<{ prev: { id: string; slug: string; title: string } | null; next: { id: string; slug: string; title: string } | null }> {
        const { data: allProducts, error } = await supabase.from(this.tableName).select("id, slug, title").order("created_at", { ascending: false });

        if (error || !allProducts || allProducts.length === 0) {
            return { prev: null, next: null };
        }

        const currentIndex = allProducts.findIndex((p) => p.id.toString() === currentIdOrSlug || p.slug === currentIdOrSlug);

        if (currentIndex === -1) {
            return { prev: null, next: null };
        }

        const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
        const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

        return {
            prev: prevProduct ? { id: prevProduct.id.toString(), slug: prevProduct.slug, title: prevProduct.title } : null,
            next: nextProduct ? { id: nextProduct.id.toString(), slug: nextProduct.slug, title: nextProduct.title } : null,
        };
    }
}

export const beybladeService = new BeybladeSupabaseService();
