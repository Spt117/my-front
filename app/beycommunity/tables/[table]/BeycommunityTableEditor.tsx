"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconArrowNarrowDown, IconArrowNarrowUp, IconBrackets, IconCheck, IconChevronDown, IconChevronRight, IconCode, IconLoader2, IconRefresh, IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnInfo, deleteTableRow, fetchTableData, updateTableRows } from "../../../supabase/actions";

type TableRow = Record<string, unknown>;

type TableEditorProps = {
    tableName: string;
    initialRows: TableRow[];
    initialColumns: ColumnInfo[];
    initialError: string | null;
};

const HIDDEN_COLUMNS = ["created_at", "updated_at"];
const ID_COLUMNS = ["id", "uuid", "_id"];

// --- COMPONENTS ---

function JsonViewer({ data, depth = 0, isExpanded = false }: { data: unknown; depth?: number; isExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(isExpanded || depth < 1);
    if (data === null) return <span className="text-slate-500 italic">null</span>;
    if (data === undefined) return <span className="text-slate-500 italic">undefined</span>;
    if (typeof data === "boolean") return <span className={data ? "text-emerald-400" : "text-rose-400"}>{data ? "true" : "false"}</span>;
    if (typeof data === "number") return <span className="text-blue-400">{data}</span>;
    if (typeof data === "string") return <span className="text-amber-400">"{data}"</span>;

    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-slate-500">[]</span>;
        return (
            <div className="font-mono text-sm">
                <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors">
                    {expanded ? <IconChevronDown className="w-3 h-3" /> : <IconChevronRight className="w-3 h-3" />}
                    <span className="text-purple-400">[</span>
                    {!expanded && <span className="text-slate-500">{data.length} items</span>}
                    {!expanded && <span className="text-purple-400">]</span>}
                </button>
                {expanded && (
                    <div className={`${depth > 0 ? "ml-4 border-l border-slate-700 pl-2" : "ml-2"}`}>
                        {data.map((item, index) => (
                            <div key={index} className="py-0.5">
                                <span className="text-slate-600 mr-2">{index}:</span>
                                <JsonViewer data={item} depth={depth + 1} />
                                {index < data.length - 1 && <span className="text-slate-600">,</span>}
                            </div>
                        ))}
                    </div>
                )}
                {expanded && <span className="text-purple-400">]</span>}
            </div>
        );
    }

    if (typeof data === "object") {
        const entries = Object.entries(data);
        if (entries.length === 0) return <span className="text-slate-500">{"{}"}</span>;
        return (
            <div className="font-mono text-sm">
                <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors">
                    {expanded ? <IconChevronDown className="w-3 h-3" /> : <IconChevronRight className="w-3 h-3" />}
                    <span className="text-cyan-400">{"{"}</span>
                    {!expanded && <span className="text-slate-500">{entries.length} keys</span>}
                    {!expanded && <span className="text-cyan-400">{"}"}</span>}
                </button>
                {expanded && (
                    <div className={`${depth > 0 ? "ml-4 border-l border-slate-700 pl-2" : "ml-2"}`}>
                        {entries.map(([key, value], index) => (
                            <div key={key} className="py-0.5 whitespace-nowrap">
                                <span className="text-blue-300">"{key}"</span>
                                <span className="text-slate-500 mx-1">:</span>
                                <JsonViewer data={value} depth={depth + 1} />
                                {index < entries.length - 1 && <span className="text-slate-600">,</span>}
                            </div>
                        ))}
                    </div>
                )}
                {expanded && <span className="text-cyan-400">{"}"}</span>}
            </div>
        );
    }
    return <span className="text-slate-400">{String(data)}</span>;
}

function ImagePreview({ url, alt = "Preview" }: { url: string; alt?: string }) {
    if (!url) return null;
    return (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
            <Image src={url} alt={alt} fill className="object-contain transition-transform group-hover:scale-125" unoptimized />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
    );
}

// --- MAIN CLIENT COMPONENT ---

export default function BeycommunityTableEditor({ tableName, initialRows, initialColumns, initialError }: TableEditorProps) {
    const [rows, setRows] = useState<TableRow[]>(initialRows);
    const [columns, setColumns] = useState<ColumnInfo[]>(initialColumns);
    const [error, setError] = useState<string | null>(initialError);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | null }>({ key: "", direction: null });
    const [jsonModal, setJsonModal] = useState<{ isOpen: boolean; value: unknown; rowId: string; column: string } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (rowId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) return;

        setDeletingId(rowId);
        const result = await deleteTableRow(tableName, rowId);
        setDeletingId(null);

        if (result.success) {
            toast.success("Ligne supprimée");
            setRows((prev) => prev.filter((r) => getRowId(r) !== rowId));
        } else {
            toast.error(result.error || "Erreur lors de la suppression");
        }
    };

    const visibleColumns = columns.filter((col) => !HIDDEN_COLUMNS.includes(col.name));

    const handleRefresh = useCallback(() => {
        startTransition(async () => {
            const result = await fetchTableData(tableName);
            if (result.error) setError(result.error);
            else if (result.data) {
                setRows(result.data.rows);
                setColumns(result.data.columns);
                setError(null);
            }
        });
    }, [tableName]);

    const getRowId = (row: TableRow): string => String(row.id || row.uuid || row._id || JSON.stringify(row));

    const startEditing = (rowId: string, column: string, currentValue: unknown) => {
        if (ID_COLUMNS.includes(column)) return;
        if (typeof currentValue === "object" && currentValue !== null) {
            setJsonModal({ isOpen: true, value: currentValue, rowId, column });
            return;
        }
        setEditingCell({ rowId, column });
        setEditValue(currentValue === null ? "" : String(currentValue));
    };

    const confirmEdit = (rowId: string, column: string) => {
        let parsedValue: unknown = editValue;
        if (editValue === "") parsedValue = null;
        else if (editValue === "true") parsedValue = true;
        else if (editValue === "false") parsedValue = false;
        else if (!isNaN(Number(editValue)) && editValue.trim() !== "") parsedValue = Number(editValue);

        setEditingCell(null);
        setEditValue("");
        saveValue(rowId, column, parsedValue);
    };

    const saveValue = (rowId: string, column: string, parsedValue: unknown) => {
        const realRowIndex = rows.findIndex((r) => getRowId(r) === rowId);
        if (realRowIndex === -1) return toast.error("Ligne introuvable");

        const newRows = [...rows];
        newRows[realRowIndex] = { ...newRows[realRowIndex], [column]: parsedValue };
        setRows(newRows);

        startSavingTransition(async () => {
            const result = await updateTableRows(tableName, [{ rowId, column, value: parsedValue }]);
            if (result.success) {
                toast.success(`Modifié avec succès`);
                const refreshResult = await fetchTableData(tableName);
                if (refreshResult.data) {
                    setRows(refreshResult.data.rows);
                    setColumns(refreshResult.data.columns);
                }
            } else {
                toast.error(result.error || "Erreur de sauvegarde");
            }
        });
    };

    const handleSort = (columnName: string) => {
        setSortConfig((prev) => {
            if (prev.key === columnName) {
                if (prev.direction === "asc") return { key: columnName, direction: "desc" };
                return { key: "", direction: null };
            }
            return { key: columnName, direction: "asc" };
        });
    };

    const filteredRows = [...rows]
        .filter((row) => {
            if (!searchTerm) return true;
            return Object.values(row).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
        })
        .sort((a, b) => {
            if (!sortConfig.key || !sortConfig.direction) return 0;
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA === valB) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;
            const res = typeof valA === "number" && typeof valB === "number" ? (valA as number) - (valB as number) : String(valA).localeCompare(String(valB));
            return sortConfig.direction === "asc" ? res : -res;
        });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/beycommunity" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                        <IconArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-blue-400 uppercase tracking-wider">{tableName}</h1>
                        <p className="text-slate-400 text-sm">{rows.length} enregistrements</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-slate-900/50 border-slate-800 focus:border-blue-500" />
                    </div>
                    <Button onClick={handleRefresh} variant="outline" className="bg-slate-900 border-slate-800 hover:bg-slate-800">
                        <IconRefresh className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {error ? (
                <Card className="p-10 text-center border-rose-500/20 bg-rose-500/5">
                    <p className="text-rose-400 mb-4">{error}</p>
                    <Button onClick={handleRefresh}>Retry</Button>
                </Card>
            ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 backdrop-blur-md overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-800">
                                    {visibleColumns.map((col) => (
                                        <th key={col.name} className="px-4 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort(col.name)}>
                                            <div className="flex items-center gap-2">
                                                {col.name}
                                                {sortConfig.key === col.name && (sortConfig.direction === "asc" ? <IconArrowNarrowUp className="w-3 h-3 text-blue-400" /> : <IconArrowNarrowDown className="w-3 h-3 text-blue-400" />)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-4 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredRows.map((row) => {
                                    const rowId = getRowId(row);
                                    return (
                                        <tr key={rowId} className="hover:bg-blue-500/5 transition-colors group">
                                            {visibleColumns.map((col) => {
                                                const value = row[col.name];
                                                const isEditing = editingCell?.rowId === rowId && editingCell?.column === col.name;
                                                const isImage = col.name.includes("image") || (col.name === "url" && String(value).startsWith("http"));
                                                const isId = ID_COLUMNS.includes(col.name);

                                                return (
                                                    <td key={col.name} className="px-4 py-3 align-middle">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <Input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmEdit(rowId, col.name)} className="h-8 py-1 px-2 text-xs bg-slate-950 border-blue-500/50" />
                                                                <button onClick={() => confirmEdit(rowId, col.name)}>
                                                                    <IconCheck className="w-4 h-4 text-emerald-400" />
                                                                </button>
                                                                <button onClick={() => setEditingCell(null)}>
                                                                    <IconX className="w-4 h-4 text-rose-400" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className={`flex items-center gap-3 ${isId ? "" : "cursor-pointer group-hover:bg-slate-800/30"} rounded p-1 transition-colors`} onClick={() => startEditing(rowId, col.name, value)}>
                                                                {isImage && typeof value === "string" ? <ImagePreview url={value} /> : col.name === "images" && Array.isArray(value) && value.length > 0 && value[0].url ? <ImagePreview url={value[0].url} /> : null}

                                                                <div className="min-w-0 flex-1">
                                                                    {typeof value === "object" && value !== null ? (
                                                                        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                                                                            <IconBrackets className="w-3 h-3" />
                                                                            {Array.isArray(value) ? `${value.length} items` : `${Object.keys(value).length} keys`}
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-sm truncate block ${isId ? "text-slate-400 font-mono text-[10px]" : "text-slate-100"}`}>{value === null ? <span className="text-slate-500">null</span> : String(value)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleDelete(rowId)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100" disabled={deletingId === rowId}>
                                                    {deletingId === rowId ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconTrash className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {jsonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setJsonModal(null)} />
                    <Card className="relative w-full max-w-2xl bg-slate-900 border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-bold text-blue-400 flex items-center gap-2 uppercase tracking-widest text-sm">
                                <IconCode className="w-4 h-4" />
                                {jsonModal.column} Editor
                            </h3>
                            <button onClick={() => setJsonModal(null)}>
                                <IconX className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-auto bg-slate-950">
                            <JsonViewer data={jsonModal.value} isExpanded={true} />
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 text-right">
                            <Button variant="outline" onClick={() => setJsonModal(null)} className="mr-2">
                                Close
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-500">Edit JSON</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
