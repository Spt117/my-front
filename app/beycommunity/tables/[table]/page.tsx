import ErrorPage from "@/components/layout/ErrorPage";
import { fetchTableData } from "../../supabase/actions";
import BeycommunityTableEditor from "./BeycommunityTableEditor";

type Props = {
    params: Promise<{ table: string }>;
};

export default async function BeycommunityTablePage({ params }: Props) {
    const { table: tableName } = await params;

    let data, error;
    try {
        ({ data, error } = await fetchTableData(tableName));
    } catch (e) {
        console.error("Erreur chargement table:", e);
        return <ErrorPage message={`Impossible de charger la table "${tableName}". Vérifiez la connexion à Supabase.`} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="relative z-10 p-6 lg:p-10">
                <BeycommunityTableEditor tableName={tableName} initialRows={data?.rows || []} initialColumns={data?.columns || []} initialError={error} />
            </div>
        </div>
    );
}
