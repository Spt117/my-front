"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCheck, IconLoader2, IconRefresh, IconX } from "@tabler/icons-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnInfo, fetchTableRow, updateTableRows } from "../../actions";

type RowEditorClientProps = {
    tableName: string;
    rowId: string;
    initialData: Record<string, unknown>;
    columns: ColumnInfo[];
};

const HIDDEN_COLUMNS = ["created_at", "updated_at"];
const ID_COLUMNS = ["id", "uuid", "_id"];

export default function RowEditorClient({ tableName, rowId, initialData, columns }: RowEditorClientProps) {
    const [data, setData] = useState<Record<string, unknown>>(initialData);
    const [editedValues, setEditedValues] = useState<Record<string, string>>({});
    const [isSaving, startSavingTransition] = useTransition();
    const [isRefreshing, startRefreshTransition] = useTransition();

    const visibleColumns = columns.filter((col) => !HIDDEN_COLUMNS.includes(col.name));

    const handleRefresh = useCallback(() => {
        startRefreshTransition(async () => {
            const result = await fetchTableRow(tableName, rowId);
            if (result.data) {
                setData(result.data);
                setEditedValues({});
                toast.success("Données actualisées");
            } else if (result.error) {
                toast.error(result.error);
            }
        });
    }, [tableName, rowId]);

    const saveField = async (column: string, value: unknown) => {
        startSavingTransition(async () => {
            const result = await updateTableRows(tableName, [{ rowId, column, value }]);
            if (result.success) {
                toast.success(`Champ '${column}' mis à jour`);
                setData((prev) => ({ ...prev, [column]: value }));
                setEditedValues((prev) => {
                    const newEdited = { ...prev };
                    delete newEdited[column];
                    return newEdited;
                });
            } else {
                toast.error(result.error || "Erreur de sauvegarde");
            }
        });
    };

    const handleInputChange = (column: string, value: string) => {
        const originalValue = formatInputValue(data[column]);

        if (value === originalValue) {
            setEditedValues((prev) => {
                const newEdited = { ...prev };
                delete newEdited[column];
                return newEdited;
            });
        } else {
            setEditedValues((prev) => ({ ...prev, [column]: value }));
        }
    };

    const cancelEdit = (column: string) => {
        setEditedValues((prev) => {
            const newEdited = { ...prev };
            delete newEdited[column];
            return newEdited;
        });
    };

    const formatInputValue = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value, null, 2);
        return String(value);
    };

    const parseInputValue = (value: string, type: string): unknown => {
        if (value.trim() === "") return null;
        if (type === "boolean") return value === "true";
        if (type === "integer" || type === "numeric") {
            const n = Number(value);
            return isNaN(n) ? value : n;
        }
        return value;
    };

    const handleKeyDown = (e: React.KeyboardEvent, column: string, type: string, isJson: boolean) => {
        if (e.key === "Escape") {
            cancelEdit(column);
            // On force le reset de la valeur de l'input via l'ID car defaultValue ne change pas
            const element = document.getElementById(`field-${column}`) as HTMLInputElement | HTMLTextAreaElement;
            if (element) element.value = formatInputValue(data[column]);
        } else if (e.key === "Enter") {
            if (isJson && !e.shiftKey) return; // Pour JSON, il faut Shift+Enter

            e.preventDefault();
            const value = editedValues[column];
            if (value === undefined) return;

            let parsedValue: unknown = value;
            if (isJson) {
                try {
                    parsedValue = JSON.parse(value);
                } catch {
                    toast.error(`JSON invalide dans le champ ${column}`);
                    return;
                }
            } else {
                parsedValue = parseInputValue(value, type);
            }
            saveField(column, parsedValue);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                            Données de la ligne
                            {isSaving && <IconLoader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs text-gray-500">
                                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">Entrée</kbd> pour sauvegarder les textes
                            </p>
                            <p className="text-xs text-gray-500">
                                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">Shift + Entrée</kbd> pour les JSON
                            </p>
                            <p className="text-xs text-gray-500">
                                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">Echap</kbd> pour annuler
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing} className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 h-9">
                        <IconRefresh className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Rafraîchir
                    </Button>
                </div>

                <div className="divide-y divide-gray-800/50">
                    {visibleColumns.map((col) => {
                        const originalValue = data[col.name];
                        const isId = ID_COLUMNS.includes(col.name);
                        const isJson = typeof originalValue === "object" && originalValue !== null;
                        const isEdited = editedValues[col.name] !== undefined;

                        return (
                            <div
                                key={col.name}
                                className={`p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start transition-colors ${isEdited ? "bg-emerald-500/5" : "hover:bg-gray-800/20"}`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">{col.name}</label>
                                        {isEdited && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Modifié" />}
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">{col.type}</p>
                                </div>

                                <div className="md:col-span-2 relative">
                                    {isId ? (
                                        <div className="bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-400 font-mono text-sm">
                                            {String(originalValue)}
                                            <span className="ml-2 text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded uppercase font-sans">Lecture seule</span>
                                        </div>
                                    ) : isJson ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-gray-700 bg-gray-950 focus-within:border-emerald-500/50 transition-all shadow-inner">
                                            {/* Code Editor Header */}
                                            <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 flex justify-between items-center select-none">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">JSON Editor</span>
                                            </div>

                                            <div className="flex relative">
                                                {/* Line numbers fake gutter */}
                                                <div className="hidden sm:flex flex-col text-right px-3 py-4 bg-gray-900/30 text-gray-600 font-mono text-xs select-none border-r border-gray-800 min-w-[40px]">
                                                    {Array.from({ length: Math.max(10, (editedValues[col.name] || formatInputValue(originalValue)).split("\n").length) }).map(
                                                        (_, i) => (
                                                            <div key={i} className="leading-6">
                                                                {i + 1}
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <textarea
                                                    id={`field-${col.name}`}
                                                    defaultValue={formatInputValue(originalValue)}
                                                    onChange={(e) => handleInputChange(col.name, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, col.name, col.type, true)}
                                                    className="w-full min-h-[250px] font-mono text-sm p-4 bg-transparent border-none text-emerald-50 focus:ring-0 focus:outline-none resize-y leading-6 selection:bg-emerald-500/30"
                                                    spellCheck={false}
                                                />
                                            </div>

                                            {isEdited && (
                                                <div className="absolute top-10 right-3 flex gap-1 z-10 animate-in fade-in slide-in-from-right-2 duration-200">
                                                    <button
                                                        onClick={() => handleKeyDown({ key: "Enter", shiftKey: true, preventDefault: () => {} } as any, col.name, col.type, true)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-md shadow-2xl transition-all hover:scale-105 active:scale-95"
                                                        title="Sauvegarder (Shift+Entrée)"
                                                    >
                                                        <IconCheck className="w-3.5 h-3.5" />
                                                        SAUVER
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEdit(col.name)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-md shadow-2xl transition-all"
                                                        title="Annuler (Echap)"
                                                    >
                                                        <IconX className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative group flex items-center gap-2">
                                            <Input
                                                id={`field-${col.name}`}
                                                defaultValue={formatInputValue(originalValue)}
                                                onChange={(e) => handleInputChange(col.name, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, col.name, col.type, false)}
                                                className={`bg-gray-950 text-gray-100 transition-all ${
                                                    isEdited ? "border-emerald-500/50 ring-2 ring-emerald-500/10" : "border-gray-700 focus:border-emerald-500"
                                                }`}
                                                placeholder={`Entrer ${col.name}...`}
                                            />
                                            {isEdited && (
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleKeyDown({ key: "Enter", preventDefault: () => {} } as any, col.name, col.type, false)}
                                                        className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded shadow-lg transition-colors"
                                                        title="Sauvegarder (Entrée)"
                                                    >
                                                        <IconCheck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEdit(col.name)}
                                                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded shadow-lg transition-colors"
                                                        title="Annuler (Echap)"
                                                    >
                                                        <IconX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
