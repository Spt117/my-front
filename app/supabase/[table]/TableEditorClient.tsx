"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconBrackets, IconCheck, IconChevronDown, IconChevronRight, IconCode, IconCopy, IconLoader2, IconRefresh, IconSearch, IconX } from "@tabler/icons-react";
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

// Composant pour afficher un JSON de manière formatée
function JsonViewer({ data, depth = 0, isExpanded = false }: { data: unknown; depth?: number; isExpanded?: boolean }) {
    const [expanded, setExpanded] = useState(isExpanded || depth < 1);

    if (data === null) {
        return <span className="text-gray-500 italic">null</span>;
    }

    if (data === undefined) {
        return <span className="text-gray-500 italic">undefined</span>;
    }

    if (typeof data === "boolean") {
        return <span className={data ? "text-green-400" : "text-red-400"}>{data ? "true" : "false"}</span>;
    }

    if (typeof data === "number") {
        return <span className="text-blue-400">{data}</span>;
    }

    if (typeof data === "string") {
        return <span className="text-amber-400">&quot;{data}&quot;</span>;
    }

    if (Array.isArray(data)) {
        if (data.length === 0) {
            return <span className="text-gray-500">[]</span>;
        }

        return (
            <div className="font-mono text-sm">
                <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors">
                    {expanded ? <IconChevronDown className="w-3 h-3" /> : <IconChevronRight className="w-3 h-3" />}
                    <span className="text-purple-400">[</span>
                    {!expanded && <span className="text-gray-500">{data.length} éléments</span>}
                    {!expanded && <span className="text-purple-400">]</span>}
                </button>
                {expanded && (
                    <div className={`${depth > 0 ? "ml-4 border-l-2 border-gray-700 pl-2" : "ml-2"}`}>
                        {data.map((item, index) => (
                            <div key={index} className="py-0.5">
                                <span className="text-gray-600 mr-2">{index}:</span>
                                <JsonViewer data={item} depth={depth + 1} />
                                {index < data.length - 1 && <span className="text-gray-600">,</span>}
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
        if (entries.length === 0) {
            return <span className="text-gray-500">{"{}"}</span>;
        }

        return (
            <div className="font-mono text-sm">
                <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors">
                    {expanded ? <IconChevronDown className="w-3 h-3" /> : <IconChevronRight className="w-3 h-3" />}
                    <span className="text-cyan-400">{"{"}</span>
                    {!expanded && <span className="text-gray-500">{entries.length} clés</span>}
                    {!expanded && <span className="text-cyan-400">{"}"}</span>}
                </button>
                {expanded && (
                    <div className={`${depth > 0 ? "ml-4 border-l-2 border-gray-700 pl-2" : "ml-2"}`}>
                        {entries.map(([key, value], index) => (
                            <div key={key} className="py-0.5">
                                <span className="text-teal-400">&quot;{key}&quot;</span>
                                <span className="text-gray-500 mx-1">:</span>
                                <JsonViewer data={value} depth={depth + 1} />
                                {index < entries.length - 1 && <span className="text-gray-600">,</span>}
                            </div>
                        ))}
                    </div>
                )}
                {expanded && <span className="text-cyan-400">{"}"}</span>}
            </div>
        );
    }

    return <span className="text-gray-400">{String(data)}</span>;
}

// Modal pour visualiser/éditer les JSON complexes
function JsonModal({ isOpen, onClose, value, onSave, columnName }: { isOpen: boolean; onClose: () => void; value: unknown; onSave: (newValue: unknown) => void; columnName: string }) {
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEditValue(JSON.stringify(value, null, 2));
            setParseError(null);
            setEditMode(false);
        }
    }, [isOpen, value]);

    useEffect(() => {
        if (editMode && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editMode]);

    if (!isOpen) return null;

    const handleSave = () => {
        try {
            const parsed = JSON.parse(editValue);
            setParseError(null);
            onSave(parsed);
            onClose();
        } catch {
            setParseError("JSON invalide");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
        toast.success("JSON copié dans le presse-papiers");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[80vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <IconCode className="w-5 h-5 text-emerald-400" />
                        <span className="font-semibold text-gray-100">{columnName}</span>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">JSON</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Copier">
                            <IconCopy className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {editMode ? (
                        <div className="space-y-2">
                            <textarea
                                ref={textareaRef}
                                value={editValue}
                                onChange={(e) => {
                                    setEditValue(e.target.value);
                                    setParseError(null);
                                }}
                                className="w-full h-[400px] font-mono text-sm p-4 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                spellCheck={false}
                            />
                            {parseError && <p className="text-red-400 text-sm">{parseError}</p>}
                        </div>
                    ) : (
                        <div className="bg-gray-950 rounded-lg p-4 overflow-auto max-h-[400px]">
                            <JsonViewer data={value} isExpanded={true} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                    <div className="text-sm text-gray-500">{typeof value === "object" && value !== null ? (Array.isArray(value) ? `${value.length} éléments` : `${Object.keys(value).length} clés`) : "Valeur primitive"}</div>
                    <div className="flex items-center gap-2">
                        {editMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditMode(false);
                                        setEditValue(JSON.stringify(value, null, 2));
                                        setParseError(null);
                                    }}
                                    className="border-gray-600 hover:bg-gray-700"
                                >
                                    Annuler
                                </Button>
                                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                    <IconCheck className="w-4 h-4 mr-2" />
                                    Sauvegarder
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setEditMode(true)} variant="outline" className="border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400">
                                <IconCode className="w-4 h-4 mr-2" />
                                Modifier
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant pour l'aperçu compact d'un JSON dans une cellule
function JsonCellPreview({ value, onClick }: { value: unknown; onClick: () => void }) {
    if (value === null) {
        return (
            <span className="text-gray-600 italic cursor-pointer hover:text-gray-400 transition-colors" onClick={onClick}>
                null
            </span>
        );
    }

    if (Array.isArray(value)) {
        return (
            <button onClick={onClick} className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group">
                <IconBrackets className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{value.length} éléments</span>
                <IconChevronRight className="w-3 h-3 text-purple-500/50 group-hover:translate-x-0.5 transition-transform" />
            </button>
        );
    }

    if (typeof value === "object") {
        const keys = Object.keys(value as object);
        return (
            <button onClick={onClick} className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all group">
                <IconCode className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{keys.length} clés</span>
                <IconChevronRight className="w-3 h-3 text-cyan-500/50 group-hover:translate-x-0.5 transition-transform" />
            </button>
        );
    }

    return (
        <span className="cursor-pointer hover:bg-gray-700/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors" onClick={onClick}>
            {String(value)}
        </span>
    );
}

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

    // État pour le modal JSON
    const [jsonModal, setJsonModal] = useState<{ isOpen: boolean; value: unknown; rowId: string; column: string } | null>(null);

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
        // Pour les objets/arrays, ouvrir le modal JSON
        if (typeof currentValue === "object" && currentValue !== null) {
            setJsonModal({ isOpen: true, value: currentValue, rowId, column });
            return;
        }

        setEditingCell({ rowId, column });
        setEditValue(currentValue === null ? "" : String(currentValue));
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setEditValue("");
    };

    const saveValue = (rowId: string, column: string, parsedValue: unknown) => {
        // Trouver l'index réel dans le tableau rows en utilisant le rowId
        const realRowIndex = rows.findIndex((r) => getRowId(r) === rowId);
        if (realRowIndex === -1) {
            toast.error("Ligne introuvable");
            return;
        }

        // Mettre à jour la valeur locale immédiatement
        const newRows = [...rows];
        newRows[realRowIndex] = { ...newRows[realRowIndex], [column]: parsedValue };
        setRows(newRows);

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

        setEditingCell(null);
        setEditValue("");

        saveValue(rowId, column, parsedValue);
    };

    const handleJsonModalSave = (newValue: unknown) => {
        if (jsonModal) {
            saveValue(jsonModal.rowId, jsonModal.column, newValue);
        }
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

    const isJsonValue = (value: unknown): boolean => {
        return typeof value === "object" && value !== null;
    };

    // Déterminer le type de colonne pour l'icône/badge
    const getColumnTypeInfo = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("json") || lowerType.includes("jsonb")) {
            return { icon: "🗃️", color: "text-cyan-400" };
        }
        if (lowerType.includes("int") || lowerType.includes("numeric") || lowerType.includes("decimal") || lowerType.includes("float")) {
            return { icon: "🔢", color: "text-blue-400" };
        }
        if (lowerType.includes("bool")) {
            return { icon: "✓✗", color: "text-green-400" };
        }
        if (lowerType.includes("text") || lowerType.includes("varchar") || lowerType.includes("char")) {
            return { icon: "📝", color: "text-amber-400" };
        }
        if (lowerType.includes("uuid")) {
            return { icon: "🔑", color: "text-purple-400" };
        }
        if (lowerType.includes("timestamp") || lowerType.includes("date") || lowerType.includes("time")) {
            return { icon: "📅", color: "text-orange-400" };
        }
        return { icon: "•", color: "text-gray-400" };
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
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-800/80 to-gray-800/40">
                                    {visibleColumns.map((col) => {
                                        const typeInfo = getColumnTypeInfo(col.type);
                                        return (
                                            <th key={col.name} className="px-4 py-3 text-left text-sm font-semibold text-gray-200 whitespace-nowrap border-b border-gray-700/50">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">{typeInfo.icon}</span>
                                                        <span>{col.name}</span>
                                                    </div>
                                                    <span className={`text-xs font-normal ${typeInfo.color}`}>{col.type}</span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/30">
                                {filteredRows.map((row, filteredRowIndex) => {
                                    const rowId = getRowId(row);
                                    return (
                                        <tr key={rowId} className="hover:bg-gray-800/30 transition-colors group">
                                            {visibleColumns.map((col) => {
                                                const isEditing = editingCell?.rowId === rowId && editingCell?.column === col.name;
                                                const value = row[col.name];
                                                const isJson = isJsonValue(value);

                                                return (
                                                    <td key={col.name} className="px-4 py-3 text-sm relative align-top">
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
                                                                    className="min-w-[200px] max-w-[400px] min-h-[32px] px-3 py-2 text-sm rounded-md resize-none overflow-hidden bg-gray-950 text-white border-2 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 selection:bg-emerald-500 selection:text-white shadow-lg shadow-emerald-500/20"
                                                                    rows={1}
                                                                />
                                                                <div className="flex flex-col gap-1">
                                                                    <button onClick={() => confirmEdit(rowId, col.name)} className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded transition-colors">
                                                                        <IconCheck className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={cancelEditing} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors">
                                                                        <IconX className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : isJson ? (
                                                            <JsonCellPreview value={value} onClick={() => startEditing(rowId, col.name, value)} />
                                                        ) : (
                                                            <div className={`cursor-pointer hover:bg-gray-700/50 rounded px-2 py-1 -mx-2 -my-1 transition-all ${getValueClass(value)}`} onClick={() => startEditing(rowId, col.name, value)} title="Cliquer pour modifier">
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
                        Cliquez sur une cellule pour la modifier • <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Enter</kbd> pour sauvegarder • <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Esc</kbd> pour annuler •{" "}
                        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">Tab</kbd> pour la cellule suivante • <IconCode className="w-3 h-3 inline-block mx-1" /> JSON : cliquer pour ouvrir l&apos;éditeur
                    </p>
                </div>
            )}

            {/* JSON Modal */}
            {jsonModal && <JsonModal isOpen={jsonModal.isOpen} onClose={() => setJsonModal(null)} value={jsonModal.value} onSave={handleJsonModalSave} columnName={jsonModal.column} />}
        </>
    );
}
