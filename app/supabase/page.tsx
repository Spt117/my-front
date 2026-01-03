import { IconDatabase } from "@tabler/icons-react";
import { fetchTables } from "./actions";
import SupabaseTableList from "./SupabaseTableList";

export default async function SupabasePage() {
    const { tables, error } = await fetchTables();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-6">
                        <IconDatabase className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4">Supabase Editor</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">Gérez et modifiez vos tables Supabase en temps réel</p>
                </header>

                <SupabaseTableList initialTables={tables} initialError={error} />
            </div>
        </div>
    );
}
