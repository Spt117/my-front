import { fetchTableData } from "../../../supabase/actions";
import BeycommunityTableEditor from "./BeycommunityTableEditor";

type Props = {
    params: Promise<{ table: string }>;
};

export default async function BeycommunityTablePage({ params }: Props) {
    const { table: tableName } = await params;
    const { data, error } = await fetchTableData(tableName);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Animated background highlights */}
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
