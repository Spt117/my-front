"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconCheck, IconLoader2, IconRefresh, IconSearch, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnInfo, fetchTableData, updateTableRows } from "../actions";

type TableRow = Record<string, unknown>;

type TableEditorClientProps = {
    tableName: string;
    initialRows: TableRow[];
    initialColumns: ColumnInfo[];
    initialError: string | null;
};

// Colonnes à masquer dans l'éditeur
const HIDDEN_COLUMNS = ["created_at", "updated_at"];

export default function TableEditorClient({ tableName, initialRows, initialColumns, initialError }: TableEditorClientProps) {
    const [rows, setRows] = useState<TableRow[]>(initialRows);
    const [columns, setColumns] = useState<ColumnInfo[]>(initialColumns);
    const [error, setError] = useState<string | null>(initialError);
    const [searchTerm, setSearchTerm] = useState("");
    // Utiliser rowId au lieu de rowIndex pour identifier la cellule en cours d'édition
    const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Filtrer les colonnes pour exclure les colonnes masquées
    const visibleColumns = columns.filter((col) => !HIDDEN_COLUMNS.includes(col.name));

    const handleRefresh = useCallback(() => {
        startTransition(async () => {
            const result = await fetchTableData(tableName);
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setRows(result.data.rows);
                setColumns(result.data.columns);
                setError(null);
            }
        });
    }, [tableName]);

    useEffect(() => {
        if (editingCell && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
            // Auto-resize
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [editingCell]);

    const getRowId = (row: TableRow): string => {
        return String(row.id || row.uuid || row._id || JSON.stringify(row));
    };

    const startEditing = (rowId: string, column: string, currentValue: unknown) => {
        setEditingCell({ rowId, column });
        setEditValue(currentValue === null ? "" : String(currentValue));
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setEditValue("");
    };

    const confirmEdit = (rowId: string, column: string) => {
        // Essayer de parser comme JSON/nombre si applicable
        let parsedValue: unknown = editValue;
        if (editValue === "") {
            parsedValue = null;
        } else if (editValue === "true") {
            parsedValue = true;
        } else if (editValue === "false") {
            parsedValue = false;
        } else if (!isNaN(Number(editValue)) && editValue.trim() !== "") {
            parsedValue = Number(editValue);
        }

        // Trouver l'index réel dans le tableau rows en utilisant le rowId
        const realRowIndex = rows.findIndex((r) => getRowId(r) === rowId);
        if (realRowIndex === -1) {
            toast.error("Ligne introuvable");
            setEditingCell(null);
            setEditValue("");
            return;
        }

        // Mettre à jour la valeur locale immédiatement
        const newRows = [...rows];
        newRows[realRowIndex] = { ...newRows[realRowIndex], [column]: parsedValue };
        setRows(newRows);

        setEditingCell(null);
        setEditValue("");

        // Sauvegarder immédiatement et rafraîchir
        startSavingTransition(async () => {
            const result = await updateTableRows(tableName, [{ rowId, column, value: parsedValue }]);

            if (result.success) {
                toast.success(`Modification sauvegardée`);
                // Rafraîchir les données
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

    const handleKeyDown = (e: React.KeyboardEvent, rowId: string, column: string, filteredRowIndex: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmEdit(rowId, column);
        } else if (e.key === "Escape") {
            cancelEditing();
        } else if (e.key === "Tab") {
            e.preventDefault();
            cancelEditing();

            // Passer à la cellule suivante (sans sauvegarder)
            const colIndex = visibleColumns.findIndex((c) => c.name === column);
            if (colIndex < visibleColumns.length - 1) {
                // Prochaine colonne sur la même ligne
                const nextColumn = visibleColumns[colIndex + 1].name;
                const row = filteredRows[filteredRowIndex];
                const nextValue = row[nextColumn];
                startEditing(getRowId(row), nextColumn, nextValue);
            } else if (filteredRowIndex < filteredRows.length - 1) {
                // Passer à la première colonne de la ligne suivante
                const nextRow = filteredRows[filteredRowIndex + 1];
                const firstColumn = visibleColumns[0].name;
                const nextValue = nextRow[firstColumn];
                startEditing(getRowId(nextRow), firstColumn, nextValue);
            }
        }
    };

    const filteredRows = rows.filter((row) => {
        if (!searchTerm) return true;
        return Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return "—";
        if (typeof value === "boolean") return value ? "✓" : "✗";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    const getValueClass = (value: unknown): string => {
        if (value === null || value === undefined) return "text-gray-600 italic";
        if (typeof value === "boolean") return value ? "text-green-400" : "text-red-400";
        if (typeof value === "number") return "text-blue-400 font-mono";
        return "text-gray-300";
    };

    return (
        <>
            {/* Header */}
            <header className="mb-8">
                <Link href="/supabase" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-4">
                    <IconArrowLeft className="w-4 h-4" />
                    Retour aux tables
                </Link>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">{tableName}</h1>
                        <p className="text-gray-400 mt-1">
                            {rows.length} lignes • {visibleColumns.length} colonnes
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {isSaving && (
                            <div className="flex items-center gap-2 text-emerald-400">
                                <IconLoader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Sauvegarde...</span>
                            </div>
                        )}
                        <Button onClick={handleRefresh} variant="outline" className="bg-gray-900/50 border-gray-800 hover:bg-emerald-500/20 hover:border-emerald-500">
                            <IconRefresh className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                            Rafraîchir
                        </Button>
                    </div>
                </div>
            </header>

            {/* Search bar */}
            <div className="relative mb-6 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input type="text" placeholder="Rechercher dans les données..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-900/50 border-gray-800 focus:border-emerald-500 text-gray-100 placeholder-gray-500" />
            </div>

            {/* Content */}
            {isPending ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <IconLoader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                    <p className="text-gray-400">Chargement des données...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                    <p className="text-red-400">{error}</p>
                    <Button onClick={handleRefresh} variant="outline" className="mt-4 border-red-500/50 hover:bg-red-500/20">
                        Réessayer
                    </Button>
                </div>
            ) : (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-800/50">
                                    {visibleColumns.map((col) => (
                                        <th key={col.name} className="px-4 py-3 text-left text-sm font-semibold text-gray-300 whitespace-nowrap border-b border-gray-700">
                                            <div className="flex flex-col">
                                                <span>{col.name}</span>
                                                <span className="text-xs text-gray-500 font-normal">{col.type}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, filteredRowIndex) => {
                                    const rowId = getRowId(row);
                                    return (
                                        <tr key={rowId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            {visibleColumns.map((col) => {
                                                const isEditing = editingCell?.rowId === rowId && editingCell?.column === col.name;
                                                const value = row[col.name];

                                                return (
                                                    <td key={col.name} className="px-4 py-2 text-sm relative group align-top">
                                                        {isEditing ? (
                                                            <div className="flex items-start gap-1">
                                                                <textarea
                                                                    ref={textareaRef}
                                                                    value={editValue}
                                                                    onChange={(e) => {
                                                                        setEditValue(e.target.value);
                                                                        // Auto-resize
                                                                        e.target.style.height = "auto";
                                                                        e.target.style.height = e.target.scrollHeight + "px";
                                                                    }}
                                                                    onKeyDown={(e) => handleKeyDown(e, rowId, col.name, filteredRowIndex)}
                                                                    className="min-w-[200px] max-w-[400px] min-h-[32px] px-3 py-2 text-sm rounded-md resize-none overflow-hidden bg-gray-950 text-white border-2 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 selection:bg-emerald-500 selection:text-white"
                                                                    rows={1}
                                                                />
                                                                <div className="flex flex-col gap-1">
                                                                    <button onClick={() => confirmEdit(rowId, col.name)} className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded">
                                                                        <IconCheck className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={cancelEditing} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded">
                                                                        <IconX className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={`cursor-pointer hover:bg-gray-700/50 rounded px-2 py-1 -mx-2 -my-1 ${getValueClass(value)}`} onClick={() => startEditing(rowId, col.name, value)} title="Cliquer pour modifier">
                                                                <span className="max-w-xs truncate block">{formatValue(value)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredRows.length === 0 && searchTerm && (
                        <div className="text-center py-12">
                            <IconSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun résultat pour &quot;{searchTerm}&quot;</p>
                        </div>
                    )}

                    {rows.length === 0 && !searchTerm && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Table vide</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer info */}
            {!isPending && !error && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                        Cliquez sur une cellule pour la modifier • Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Enter</kbd> pour sauvegarder • <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Esc</kbd> pour annuler •{" "}
                        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Tab</kbd> pour passer à la cellule suivante
                    </p>
                </div>
            )}
        </>
    );
}
