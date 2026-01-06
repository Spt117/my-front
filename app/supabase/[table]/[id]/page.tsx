import { fetchTableRow } from "../../actions";
import RowEditorClient from "./RowEditorClient";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

type RowEditorPageProps = {
    params: Promise<{ table: string; id: string }>;
};

export default async function RowEditorPage({ params }: RowEditorPageProps) {
    const { table: tableName, id: rowId } = await params;
    const { data, columns, error } = await fetchTableRow(tableName, rowId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 p-6 lg:p-8 w-full max-w-none">
                <header className="mb-8">
                    <Link 
                        href={`/supabase/${tableName}`} 
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-4"
                    >
                        <IconArrowLeft className="w-4 h-4" />
                        Retour à la table {tableName}
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Modifier la ligne
                        </h1>
                        <p className="text-gray-400 mt-1 font-mono text-sm">
                            ID: {rowId}
                        </p>
                    </div>
                </header>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                        <p className="text-red-400">{error}</p>
                        <Link 
                            href={`/supabase/${tableName}`}
                            className="inline-block mt-4 text-emerald-400 hover:underline"
                        >
                            Retour à la table
                        </Link>
                    </div>
                ) : data ? (
                    <RowEditorClient 
                        tableName={tableName} 
                        rowId={rowId} 
                        initialData={data} 
                        columns={columns} 
                    />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400">Ligne non trouvée</p>
                    </div>
                )}
            </div>
        </div>
    );
}
