import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Créer le client uniquement si les variables sont définies
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase non configuré. Veuillez définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans vos variables d'environnement.");
    }

    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }

    return supabaseInstance;
}

// Export un proxy qui crée le client à la demande
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        const client = getSupabaseClient();
        const value = client[prop as keyof SupabaseClient];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});

export { getSupabaseClient };

export type SupabaseTable = {
    table_name: string;
    table_schema: string;
};
