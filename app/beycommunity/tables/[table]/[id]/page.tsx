import ErrorPage from "@/components/layout/ErrorPage";
import { notFound } from "next/navigation";
import { fetchTableRow } from "../../../supabase/actions";
import BeycommunityItemEditor from "./BeycommunityItemEditor";

export default async function BeycommunityItemPage({ params }: { params: Promise<{ table: string; id: string }> }) {
    const { table, id } = await params;

    let data, columns, error;
    try {
        ({ data, columns, error } = await fetchTableRow(table, id));
    } catch (e) {
        console.error(`Erreur chargement item ${id} de la table ${table}:`, e);
        return <ErrorPage message={`Impossible de charger l'élément. Vérifiez la connexion à Supabase.`} />;
    }

    if (error || !data) {
        console.error(`Error loading item ${id} from table ${table}:`, error);
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 sm:p-12">
            <BeycommunityItemEditor tableName={table} id={id} initialData={data} columns={columns} />
        </div>
    );
}
