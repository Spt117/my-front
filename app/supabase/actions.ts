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

// Découverte dynamique des tables
async function discoverTables(): Promise<TableInfo[]> {
    const potentialTables = ["x_products"];
    const validTables: TableInfo[] = [];

    for (const tableName of potentialTables) {
        try {
            const { error } = await supabase.from(tableName).select("*").limit(1);

            if (!error) {
                const { count } = await supabase.from(tableName).select("*", { count: "exact", head: true });

                validTables.push({
                    table_name: tableName,
                    row_count: count ?? 0,
                });
            }
        } catch {
            // Table n'existe pas ou pas accessible
        }
    }

    return validTables;
}

// Récupérer la liste des tables
export async function fetchTables(): Promise<{ tables: TableInfo[]; error: string | null }> {
    try {
        // Méthode 1: Essayer d'utiliser une fonction RPC personnalisée
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_tables");

        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
            const tables = await Promise.all(
                rpcData.map(async (t: { table_name: string }) => {
                    const count = await getTableRowCount(t.table_name);
                    return { table_name: t.table_name, row_count: count };
                })
            );
            return { tables: tables.filter((t) => t.row_count >= 0), error: null };
        }

        // Méthode 2: Interroger information_schema via une requête SQL brute
        const { data: schemaData, error: schemaError } = await supabase
            .from("information_schema.tables" as string)
            .select("table_name")
            .eq("table_schema", "public")
            .eq("table_type", "BASE TABLE");

        if (!schemaError && schemaData && schemaData.length > 0) {
            const tables = await Promise.all(
                schemaData.map(async (t: { table_name: string }) => {
                    const count = await getTableRowCount(t.table_name);
                    return { table_name: t.table_name, row_count: count };
                })
            );
            return { tables: tables.filter((t) => t.row_count >= 0), error: null };
        }

        // Méthode 3: Découverte dynamique
        console.log("Fallback: découverte dynamique des tables...");
        const discoveredTables = await discoverTables();
        return { tables: discoveredTables, error: null };
    } catch (error) {
        console.error("Error fetching tables:", error);
        return { tables: [], error: "Erreur lors de la récupération des tables" };
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
