"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IconChevronDown, IconChevronRight, IconCloudUpload, IconCopy, IconLoader2, IconWebhook } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeepaSettings, resyncKeepaWebhook, updateKeepaSettings } from "./serverAction";

interface Props {
    initialSettings: KeepaSettings | null;
}

export default function SettingsPanel({ initialSettings }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [enabled, setEnabled] = useState<boolean>(initialSettings?.fallbackEnabled ?? true);
    const [intervalHours, setIntervalHours] = useState<number>(initialSettings?.fallbackIntervalHours ?? 3);
    const [updating, startUpdate] = useTransition();
    const [resyncing, startResync] = useTransition();

    if (!initialSettings) {
        return (
            <div className="bg-rose-900/20 border border-rose-800 rounded-2xl p-4 text-rose-300 text-sm">
                ⚠️ Settings Keepa non initialisés. Lance le script de migration sur le backend
                (<code className="font-mono">setupKeepaCollections.ts --apply</code>).
            </div>
        );
    }

    const handleToggleFallback = (value: boolean) => {
        setEnabled(value);
        startUpdate(async () => {
            const result = await updateKeepaSettings({ fallbackEnabled: value });
            if (!result.success) {
                toast.error(result.error || "Erreur sauvegarde");
                setEnabled(!value);
                return;
            }
            toast.success(value ? "Filet de rattrapage activé" : "Filet de rattrapage désactivé");
            router.refresh();
        });
    };

    const handleChangeInterval = (value: number) => {
        if (value !== 3 && value !== 6) return;
        setIntervalHours(value);
        startUpdate(async () => {
            const result = await updateKeepaSettings({ fallbackIntervalHours: value });
            if (!result.success) {
                toast.error(result.error || "Erreur sauvegarde");
                return;
            }
            toast.success(`Filet de rattrapage configuré sur ${value}h`);
            router.refresh();
        });
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(initialSettings.webhookUrl);
            toast.success("URL webhook copiée");
        } catch {
            toast.error("Impossible de copier");
        }
    };

    const handleResync = () => {
        startResync(async () => {
            const result = await resyncKeepaWebhook();
            if (!result.success) {
                toast.error(result.error || "Erreur re-sync");
                return;
            }
            toast.success("URL webhook re-poussée chez Keepa");
        });
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <IconWebhook className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">Webhook & filet de rattrapage</p>
                        <p className="text-xs text-slate-500">
                            {enabled ? `Filet actif toutes les ${intervalHours}h` : "Webhook seul (filet désactivé)"}
                            {initialSettings.lastWebhookSync &&
                                ` · dernier sync ${new Date(initialSettings.lastWebhookSync).toLocaleString("fr-FR")}`}
                        </p>
                    </div>
                </div>
                {open ? (
                    <IconChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                    <IconChevronRight className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {open && (
                <div className="border-t border-slate-800 p-4 space-y-4">
                    {/* URL webhook */}
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            URL webhook (configurée chez Keepa)
                        </label>
                        <div className="mt-1 flex gap-2">
                            <code className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 truncate">
                                {initialSettings.webhookUrl}
                            </code>
                            <button
                                onClick={handleCopyUrl}
                                className="px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center"
                                title="Copier l'URL"
                            >
                                <IconCopy className="w-4 h-4" />
                            </button>
                            <Button
                                onClick={handleResync}
                                disabled={resyncing}
                                className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer"
                            >
                                {resyncing ? (
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <IconCloudUpload className="w-4 h-4 mr-2" />
                                )}
                                Re-sync chez Keepa
                            </Button>
                        </div>
                    </div>

                    {/* Toggle filet */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-bold text-white">Filet de rattrapage cron</p>
                            <p className="text-xs text-slate-500">
                                Pull périodique des notifications Keepa au cas où le webhook aurait raté un event.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={enabled} onCheckedChange={handleToggleFallback} disabled={updating} />
                            <Badge
                                className={
                                    enabled
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        : "bg-slate-800 text-slate-400 border-slate-700"
                                }
                            >
                                {enabled ? "Actif" : "Désactivé"}
                            </Badge>
                        </div>
                    </div>

                    {/* Sélection fréquence */}
                    <div className="flex items-center justify-between py-2 opacity-100" style={{ opacity: enabled ? 1 : 0.5 }}>
                        <div>
                            <p className="text-sm font-bold text-white">Fréquence de rattrapage</p>
                            <p className="text-xs text-slate-500">
                                Plus court = moins de risque de manquer un event si le webhook tombe. Plus long = moins de calls Keepa.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <FreqBtn
                                active={intervalHours === 3}
                                disabled={!enabled || updating}
                                onClick={() => handleChangeInterval(3)}
                            >
                                3h
                            </FreqBtn>
                            <FreqBtn
                                active={intervalHours === 6}
                                disabled={!enabled || updating}
                                onClick={() => handleChangeInterval(6)}
                            >
                                6h
                            </FreqBtn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FreqBtn({
    active,
    disabled,
    onClick,
    children,
}: {
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                active
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
        >
            {children}
        </button>
    );
}
