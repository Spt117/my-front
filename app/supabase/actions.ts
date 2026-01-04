"use server";

import { supabase } from "@/library/supabase/client";

export type TableInfo = {
    table_name: string;
    row_count: number;
};

export type ColumnInfo = {
    name: string;
    type: string;
};

export type TableData = {
    rows: Record<string, unknown>[];
    columns: ColumnInfo[];
};

// Récupérer le nombre de lignes d'une table
async function getTableRowCount(tableName: string): Promise<number> {
    try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });

        if (error) {
            if (error.code === "42P01" || error.message.includes("does not exist")) {
                return -1;
            }
            console.error(`Error counting rows for ${tableName}:`, error.message);
            return -1;
        }

        return count ?? 0;
    } catch {
        return -1;
    }
}

// Liste de tables potentielles à découvrir (fallback)
const POTENTIAL_TABLES = [
    // Tables Supabase système communes
    "profiles",
    "users",
    // Tables personnalisées - ajoutez vos tables ici
    "x_products",
    "products",
    "categories",
    "orders",
    "customers",
    "items",
    "settings",
    "configurations",
    "logs",
    "events",
    "sessions",
    "tokens",
    "subscriptions",
    "payments",
    "invoices",
    "notifications",
    "messages",
    "comments",
    "tags",
    "media",
    "files",
    "uploads",
];

// Découverte dynamique des tables via SQL
async function discoverTablesViaSql(): Promise<string[]> {
    try {
        // Essayer d'exécuter une requête SQL pour obtenir toutes les tables publiques
        const { data, error } = await supabase.rpc("get_all_tables");

        if (!error && data && Array.isArray(data)) {
            return data.map((t: { tablename?: string; table_name?: string }) => t.tablename || t.table_name || "").filter(Boolean);
        }
    } catch {
        // La fonction RPC n'existe pas, on continue avec le fallback
    }

    return [];
}

// Découverte dynamique des tables
async function discoverTables(): Promise<TableInfo[]> {
    const validTables: TableInfo[] = [];

    // Essayer d'abord la découverte via SQL
    let tableNames = await discoverTablesViaSql();

    // Si aucune table n'a été trouvée via SQL, utiliser la liste de fallback
    if (tableNames.length === 0) {
        tableNames = POTENTIAL_TABLES;
    }

    // Vérifier chaque table en parallèle pour plus de rapidité
    const results = await Promise.allSettled(
        tableNames.map(async (tableName) => {
            try {
                const { error } = await supabase.from(tableName).select("*").limit(1);

                if (!error) {
                    const { count } = await supabase.from(tableName).select("*", { count: "exact", head: true });

                    return {
                        table_name: tableName,
                        row_count: count ?? 0,
                    };
                }
            } catch {
                // Table n'existe pas ou pas accessible
            }
            return null;
        })
    );

    for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
            validTables.push(result.value);
        }
    }

    // Trier les tables par nom
    return validTables.sort((a, b) => a.table_name.localeCompare(b.table_name));
}

// Récupérer la liste des tables
export async function fetchTables(): Promise<{ tables: TableInfo[]; error: string | null }> {
    // Liste des tables connues à vérifier si la découverte automatique échoue
    const manualTableList = ["x_products"];
    const foundTables: TableInfo[] = [];

    try {
        // Tentative 1: Utiliser la clé Service Role (Admin) pour accéder à information_schema
        // Cette clé a les droits complets et peut voir les métadonnées
        const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (adminKey && supabaseUrl) {
            const { createClient } = await import("@supabase/supabase-js");
            const adminClient = createClient(supabaseUrl, adminKey);

            const { data: schemaData, error: schemaError } = await adminClient
                .from("information_schema.tables" as string)
                .select("table_name")
                .eq("table_schema", "public")
                .eq("table_type", "BASE TABLE");

            if (!schemaError && schemaData && schemaData.length > 0) {
                const tables = schemaData.map((t: { table_name: string }) => ({
                    table_name: t.table_name,
                    row_count: 0,
                }));
                return { tables: tables.sort((a: TableInfo, b: TableInfo) => a.table_name.localeCompare(b.table_name)), error: null };
            }
        }

        // Tentative 2: Fallback manuel - Vérifier l'existence de tables connues
        // Utile si on n'a que la clé publique (anon) et pas de fonction RPC
        for (const tableName of manualTableList) {
            const { error, count } = await supabase.from(tableName).select("*", { count: "exact", head: true });
            if (!error) {
                foundTables.push({
                    table_name: tableName,
                    row_count: count ?? 0,
                });
            }
        }

        if (foundTables.length > 0) {
            return { tables: foundTables.sort((a, b) => a.table_name.localeCompare(b.table_name)), error: null };
        }

        return {
            tables: [],
            error: "Impossible de récupérer la liste des tables. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est défini dans votre .env ou que vos tables 'x_products', etc. existent.",
        };
    } catch (error) {
        console.error("Error fetching tables:", error);
        return { tables: [], error: `Erreur inattendue: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// Récupérer les données d'une table
export async function fetchTableData(tableName: string): Promise<{ data: TableData | null; error: string | null }> {
    try {
        const { data: rows, error: rowsError } = await supabase.from(tableName).select("*").limit(1000);

        if (rowsError) {
            return { data: null, error: rowsError.message };
        }

        // Extraire les colonnes à partir des données
        const columns: ColumnInfo[] = [];
        if (rows && rows.length > 0) {
            const firstRow = rows[0];
            for (const [key, value] of Object.entries(firstRow)) {
                let type = "text";
                if (value === null) {
                    type = "unknown";
                } else if (typeof value === "number") {
                    type = Number.isInteger(value) ? "integer" : "numeric";
                } else if (typeof value === "boolean") {
                    type = "boolean";
                } else if (typeof value === "object") {
                    type = Array.isArray(value) ? "array" : "json";
                } else if (typeof value === "string") {
                    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
                        type = "timestamp";
                    } else if (value.length > 100) {
                        type = "text (long)";
                    }
                }
                columns.push({ name: key, type });
            }
        }

        return {
            data: { rows: rows || [], columns },
            error: null,
        };
    } catch (error) {
        console.error("Error fetching table data:", error);
        return { data: null, error: "Erreur interne du serveur" };
    }
}

// Mettre à jour des lignes
export async function updateTableRows(
    tableName: string,
    changes: Array<{ rowId: string; column: string; value: unknown }>
): Promise<{
    success: boolean;
    updated: number;
    failures: Array<{ rowId: string; error: string }>;
    error: string | null;
}> {
    try {
        if (!changes || !Array.isArray(changes)) {
            return { success: false, updated: 0, failures: [], error: "Format de données invalide" };
        }

        // Grouper les modifications par rowId
        const groupedChanges = new Map<string, Record<string, unknown>>();
        for (const change of changes) {
            if (!groupedChanges.has(change.rowId)) {
                groupedChanges.set(change.rowId, {});
            }
            groupedChanges.get(change.rowId)![change.column] = change.value;
        }

        // Appliquer les modifications
        const results: { success: boolean; rowId: string; error?: string }[] = [];

        for (const [rowId, updates] of groupedChanges.entries()) {
            try {
                const { error } = await supabase.from(tableName).update(updates).eq("id", rowId);

                if (error) {
                    results.push({ success: false, rowId, error: error.message });
                } else {
                    results.push({ success: true, rowId });
                }
            } catch (err) {
                results.push({
                    success: false,
                    rowId,
                    error: err instanceof Error ? err.message : "Erreur inconnue",
                });
            }
        }

        const allSuccess = results.every((r) => r.success);
        const failures = results.filter((r) => !r.success).map((r) => ({ rowId: r.rowId, error: r.error || "" }));

        if (allSuccess) {
            return { success: true, updated: results.length, failures: [], error: null };
        } else {
            return {
                success: false,
                updated: results.filter((r) => r.success).length,
                failures,
                error: `${failures.length} erreur(s) lors de la mise à jour`,
            };
        }
    } catch (error) {
        console.error("Error updating table data:", error);
        return { success: false, updated: 0, failures: [], error: "Erreur interne du serveur" };
    }
}

// Supprimer une ligne
export async function deleteTableRow(tableName: string, rowId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!rowId) {
            return { success: false, error: "rowId manquant" };
        }

        const { error } = await supabase.from(tableName).delete().eq("id", rowId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting row:", error);
        return { success: false, error: "Erreur interne du serveur" };
    }
}

// Créer une nouvelle ligne
export async function createTableRow(tableName: string, row: Record<string, unknown>): Promise<{ success: boolean; row: Record<string, unknown> | null; error: string | null }> {
    try {
        if (!row) {
            return { success: false, row: null, error: "Données de la ligne manquantes" };
        }

        const { data, error } = await supabase.from(tableName).insert(row).select().single();

        if (error) {
            return { success: false, row: null, error: error.message };
        }

        return { success: true, row: data, error: null };
    } catch (error) {
        console.error("Error creating row:", error);
        return { success: false, row: null, error: "Erreur interne du serveur" };
    }
}
