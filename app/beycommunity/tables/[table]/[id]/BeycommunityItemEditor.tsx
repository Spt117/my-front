"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IconAlertCircle, IconArrowLeft, IconCalendar, IconCheck, IconDeviceFloppy, IconHash, IconHistory, IconInfoCircle, IconLoader2, IconToggleRight, IconTypography } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnInfo, updateTableRows } from "../../../../supabase/actions";

type Props = {
    tableName: string;
    id: string;
    initialData: Record<string, unknown>;
    columns: ColumnInfo[];
};

export default function BeycommunityItemEditor({ tableName, id, initialData, columns }: Props) {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [isPending, startTransition] = useTransition();
    const [hasChanges, setHasChanges] = useState(false);

    const ID_COLUMNS = ["id", "uuid", "_id"];
    const READ_ONLY_COLUMNS = ["created_at", "updated_at", ...ID_COLUMNS];

    const handleChange = (key: string, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!hasChanges) return;

        startTransition(async () => {
            const changes = Object.entries(data)
                .filter(([key, value]) => value !== initialData[key] && !READ_ONLY_COLUMNS.includes(key))
                .map(([key, value]) => ({ rowId: id, column: key, value }));

            if (changes.length === 0) {
                setHasChanges(false);
                return;
            }

            const result = await updateTableRows(tableName, changes);

            if (result.success) {
                toast.success("Modifications enregistrées avec succès !");
                setHasChanges(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erreur lors de l'enregistrement");
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/beycommunity/tables/${tableName}`} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white group">
                        <IconArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-widest">{tableName}</span>
                        </div>
                        <h1 className="text-2xl font-black text-white italic truncate max-w-md">
                            Édition de l'élément <span className="text-blue-500">#{id.slice(0, 8)}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold animate-pulse mr-2">
                            <IconAlertCircle className="w-4 h-4" />
                            Modifications non enregistrées
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={!hasChanges || isPending} className={`font-bold transition-all ${hasChanges ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
                        {isPending ? <IconLoader2 className="w-4 h-4 animate-spin mr-2" /> : <IconDeviceFloppy className="w-4 h-4 mr-2" />}
                        Enregistrer
                    </Button>
                </div>
            </div>

            {/* Main Form Card */}
            <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/30">
                    <CardTitle className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <IconInfoCircle className="w-4 h-4 text-blue-400" />
                        Informations détaillées
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {columns
                            .filter((col) => !READ_ONLY_COLUMNS.includes(col.name))
                            .map((col) => {
                                const value = data[col.name];
                                const initialValue = initialData[col.name];
                                const isChanged = value !== initialValue;
                                const isLongText = col.type.includes("text (long)") || (typeof value === "string" && value.length > 100);
                                const isJson = col.type === "json" || col.type === "array";
                                const isBoolean = col.type === "boolean" || typeof value === "boolean";
                                const isNumeric = col.type === "integer" || col.type === "numeric" || typeof value === "number";

                                const getIcon = () => {
                                    if (isNumeric) return <IconHash className="w-3.5 h-3.5" />;
                                    if (isBoolean) return <IconToggleRight className="w-3.5 h-3.5" />;
                                    if (col.type === "timestamp") return <IconCalendar className="w-3.5 h-3.5" />;
                                    return <IconTypography className="w-3.5 h-3.5" />;
                                };

                                return (
                                    <div key={col.name} className={`space-y-3 p-4 rounded-2xl border transition-all ${isChanged ? "bg-amber-500/5 border-amber-500/20" : "bg-slate-950/20 border-slate-800/50"} ${isLongText || isJson ? "md:col-span-2" : ""}`}>
                                        <div className="flex items-center justify-between pl-1">
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="text-blue-500/50">{getIcon()}</span>
                                                    {col.name}
                                                </Label>
                                                <span className="text-[9px] text-slate-600 font-mono uppercase font-bold">{col.type}</span>
                                            </div>
                                            {isChanged && <span className="text-[9px] text-amber-500 font-black uppercase tracking-tighter bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Modifié</span>}
                                        </div>

                                        {isBoolean ? (
                                            <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 w-fit">
                                                <Switch checked={!!value} onCheckedChange={(checked) => handleChange(col.name, checked)} />
                                                <span className={`text-xs font-bold ${value ? "text-emerald-400" : "text-slate-400"}`}>{value ? "Activé (True)" : "Désactivé (False)"}</span>
                                            </div>
                                        ) : isJson ? (
                                            <div className="space-y-2">
                                                <div className="text-xs text-blue-400/80 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono overflow-auto max-h-60 shadow-inner">
                                                    <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                                </div>
                                                <p className="text-[9px] text-slate-600 italic pl-1 flex items-center gap-1">
                                                    <IconInfoCircle className="w-3 h-3" />
                                                    L'édition directe du JSON sera bientôt disponible ici.
                                                </p>
                                            </div>
                                        ) : isLongText ? (
                                            <Textarea
                                                value={String(value || "")}
                                                onChange={(e) => handleChange(col.name, e.target.value)}
                                                className={`min-h-[140px] bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-slate-100 transition-all rounded-xl resize-none`}
                                                placeholder={`Entrez ${col.name}...`}
                                            />
                                        ) : (
                                            <div className="relative group">
                                                <Input
                                                    value={String(value === null ? "" : value)}
                                                    onChange={(e) => handleChange(col.name, e.target.value)}
                                                    type={isNumeric ? "number" : "text"}
                                                    className={`bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-slate-100 transition-all pr-12 h-11 rounded-xl`}
                                                />
                                                {isChanged && !isPending && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/60 flex items-center gap-2">
                                                        <button onClick={() => handleChange(col.name, initialValue)} className="p-1 hover:bg-slate-800 rounded transition-all" title="Réinitialiser">
                                                            <IconHistory className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Footer Stats / Meta */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 px-4">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <IconCheck className="w-3 h-3 text-emerald-500" />
                        Données synchronisées
                    </span>
                    <span className="uppercase tracking-widest font-bold">Base de données: Supabase / PostgreSQL</span>
                </div>
                <div className="font-mono">ID Local: {id}</div>
            </div>
        </div>
    );
}
