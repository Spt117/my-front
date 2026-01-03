import { fetchTableData } from "../actions";
import TableEditorClient from "./TableEditorClient";

type TableEditorPageProps = {
    params: Promise<{ table: string }>;
};

export default async function TableEditorPage({ params }: TableEditorPageProps) {
    const { table: tableName } = await params;
    const { data, error } = await fetchTableData(tableName);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 p-6 lg:p-8">
                <TableEditorClient tableName={tableName} initialRows={data?.rows || []} initialColumns={data?.columns || []} initialError={error} />
            </div>
        </div>
    );
}
