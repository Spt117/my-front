"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconDatabase, IconLoader2, IconRefresh, IconSearch, IconTable } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { fetchTables, TableInfo } from "./actions";

type SupabaseTableListProps = {
    initialTables: TableInfo[];
    initialError: string | null;
};

export default function SupabaseTableList({ initialTables, initialError }: SupabaseTableListProps) {
    const [tables, setTables] = useState<TableInfo[]>(initialTables);
    const [error, setError] = useState<string | null>(initialError);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(async () => {
            const result = await fetchTables();
            setTables(result.tables);
            setError(result.error);
        });
    };

    const filteredTables = tables.filter((table) => table.table_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input type="text" placeholder="Rechercher une table..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-900/50 border-gray-800 focus:border-emerald-500 text-gray-100 placeholder-gray-500" />
                </div>
                <Button onClick={handleRefresh} variant="outline" className="bg-gray-900/50 border-gray-800 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all">
                    <IconRefresh className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                    Rafraîchir
                </Button>
            </div>

            {/* Content */}
            {isPending ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <IconLoader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                    <p className="text-gray-400">Chargement des tables...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                    <p className="text-red-400">{error}</p>
                    <Button onClick={handleRefresh} variant="outline" className="mt-4 border-red-500/50 hover:bg-red-500/20">
                        Réessayer
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTables.map((table) => (
                        <Link
                            key={table.table_name}
                            href={`/supabase/${table.table_name}`}
                            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <IconTable className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-100 truncate group-hover:text-emerald-400 transition-colors">{table.table_name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{table.row_count.toLocaleString()} lignes</p>
                                </div>
                            </div>
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-emerald-400">Ouvrir →</span>
                            </div>
                        </Link>
                    ))}

                    {filteredTables.length === 0 && searchTerm && (
                        <div className="col-span-full text-center py-12">
                            <IconSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune table trouvée pour &quot;{searchTerm}&quot;</p>
                        </div>
                    )}

                    {tables.length === 0 && !searchTerm && (
                        <div className="col-span-full text-center py-12">
                            <IconDatabase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune table disponible</p>
                        </div>
                    )}
                </div>
            )}

            {/* Stats footer */}
            {!isPending && !error && tables.length > 0 && (
                <div className="mt-8 flex justify-center gap-8 text-sm text-gray-500">
                    <span>{tables.length} tables</span>
                    <span>•</span>
                    <span>{tables.reduce((acc, t) => acc + t.row_count, 0).toLocaleString()} lignes totales</span>
                </div>
            )}
        </>
    );
}
