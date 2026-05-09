"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    IconAlertTriangle,
    IconBell,
    IconBellOff,
    IconExternalLink,
    IconLoader2,
    IconPackageOff,
    IconPlus,
    IconRefresh,
    IconShoppingCart,
    IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    addKeepaWatch,
    deleteKeepaWatch,
    KeepaSettings,
    KeepaWatch,
    refreshKeepaWatch,
    syncKeepaNotifications,
    toggleKeepaAlert,
} from "./serverAction";
import SettingsPanel from "./SettingsPanel";

// Domaines Keepa supportés (cf. pokemon/src/app/keepa/keepaMarketplaces.ts)
const MARKETPLACES = [
    { domainId: 4, code: "FR", label: "Amazon FR", tld: "fr" },
    { domainId: 1, code: "US", label: "Amazon US", tld: "com" },
    { domainId: 3, code: "DE", label: "Amazon DE", tld: "de" },
    { domainId: 2, code: "GB", label: "Amazon UK", tld: "co.uk" },
    { domainId: 8, code: "IT", label: "Amazon IT", tld: "it" },
    { domainId: 9, code: "ES", label: "Amazon ES", tld: "es" },
    { domainId: 5, code: "JP", label: "Amazon JP", tld: "co.jp" },
    { domainId: 6, code: "CA", label: "Amazon CA", tld: "ca" },
    { domainId: 10, code: "IN", label: "Amazon IN", tld: "in" },
    { domainId: 11, code: "MX", label: "Amazon MX", tld: "com.mx" },
];

function timeAgo(iso: string): string {
    if (!iso) return "Jamais";
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.round(diff / 60000);
    if (min < 1) return "À l'instant";
    if (min < 60) return `${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h} h`;
    const d = Math.round(h / 24);
    return `${d} j`;
}

function formatPrice(cents: number): string {
    if (cents === undefined || cents === null || cents === -1) return "—";
    return (cents / 100).toFixed(2);
}

function amazonUrl(asin: string, domainId: number): string {
    const mp = MARKETPLACES.find((m) => m.domainId === domainId);
    if (!mp) return `https://www.amazon.com/dp/${asin}`;
    return `https://www.amazon.${mp.tld}/dp/${asin}`;
}

interface Props {
    initialWatches: KeepaWatch[];
    initialSettings: KeepaSettings | null;
}

export default function KeepaPage({ initialWatches, initialSettings }: Props) {
    const router = useRouter();
    const [watches, setWatches] = useState<KeepaWatch[]>(initialWatches);
    const [newAsin, setNewAsin] = useState("");
    const [newDomainId, setNewDomainId] = useState<number>(4); // FR par défaut
    const [adding, startAdd] = useTransition();
    const [syncing, startSync] = useTransition();
    const [refreshingId, setRefreshingId] = useState<string | null>(null);

    const stats = useMemo(() => {
        const total = watches.length;
        const inStock = watches.filter((w) => w.amazonAvailable).length;
        const outOfStock = total - inStock;
        const activeAlerts = watches.filter((w) => w.alertRestock || w.alertOutOfStock).length;
        return { total, inStock, outOfStock, activeAlerts };
    }, [watches]);

    const handleAdd = () => {
        const asin = newAsin.trim().toUpperCase();
        if (!asin) return;
        if (asin.length !== 10) {
            toast.error("Un ASIN Amazon fait 10 caractères");
            return;
        }
        startAdd(async () => {
            const result = await addKeepaWatch(asin, newDomainId);
            if (!result.success) {
                toast.error(result.error || "Erreur ajout watch");
                return;
            }
            const tokensInfo = result.tokensLeft !== undefined ? ` (${result.tokensLeft} tokens restants)` : "";
            if (result.warning) {
                toast.warning(result.warning + tokensInfo);
            } else {
                toast.success(`ASIN ${asin} ajouté à la surveillance${tokensInfo}`);
            }
            setNewAsin("");
            router.refresh();
        });
    };

    const handleToggle = async (
        watch: KeepaWatch,
        field: "alertRestock" | "alertOutOfStock",
        value: boolean,
    ) => {
        // Optimiste
        setWatches((prev) => prev.map((w) => (w.id === watch.id ? { ...w, [field]: value } : w)));
        const result = await toggleKeepaAlert(watch.id, field, value);
        if (!result.success) {
            toast.error(result.error || "Erreur mise à jour");
            setWatches((prev) => prev.map((w) => (w.id === watch.id ? { ...w, [field]: !value } : w)));
            return;
        }
        const label = field === "alertRestock" ? "restock" : "rupture";
        const action = value ? "activée" : "désactivée";
        toast.success(`Alerte ${label} ${action}`, { description: watch.title?.slice(0, 60) });
    };

    const handleRefresh = async (watch: KeepaWatch) => {
        setRefreshingId(watch.id);
        try {
            const result = await refreshKeepaWatch(watch.id);
            if (!result.success) {
                toast.error(result.error || "Erreur refresh");
                return;
            }
            const tokensInfo = result.tokensLeft !== undefined ? ` (${result.tokensLeft} tokens restants)` : "";
            toast.success(`Refresh ${watch.asin} OK${tokensInfo}`);
            router.refresh();
        } finally {
            setRefreshingId(null);
        }
    };

    const handleDelete = async (watch: KeepaWatch) => {
        if (!confirm(`Arrêter de surveiller ${watch.asin} (${watch.marketplaceCode}) ?`)) return;
        const result = await deleteKeepaWatch(watch.id);
        if (!result.success) {
            toast.error(result.error || "Erreur suppression");
            return;
        }
        setWatches((prev) => prev.filter((w) => w.id !== watch.id));
        toast.success("Surveillance supprimée");
    };

    const handleSync = () => {
        startSync(async () => {
            const result = await syncKeepaNotifications();
            if (!result.success) {
                toast.error(result.error || "Erreur sync");
                return;
            }
            toast.success(`Sync OK : ${result.received} reçues, ${result.handled} traitées`);
            router.refresh();
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
                            <IconShoppingCart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Keepa Watch</h1>
                            <p className="text-slate-400">Surveillance Amazon comme vendeur · webhook temps réel</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-white text-black hover:bg-amber-500 hover:text-white cursor-pointer"
                    >
                        {syncing ? (
                            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <IconRefresh className="w-4 h-4 mr-2" />
                        )}
                        Sync notifications
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total surveillés" value={stats.total} color="slate" />
                    <StatCard label="Amazon vendeur" value={stats.inStock} color="emerald" />
                    <StatCard label="Pas vendeur" value={stats.outOfStock} color="rose" />
                    <StatCard label="Alertes actives" value={stats.activeAlerts} color="amber" />
                </div>

                {/* Settings panel */}
                <SettingsPanel initialSettings={initialSettings} />

                {/* Ajout ASIN */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 my-6 flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="ASIN (ex: B0CYZVB7KL)"
                        value={newAsin}
                        onChange={(e) => setNewAsin(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd();
                            else if (e.key === "Escape") setNewAsin("");
                        }}
                        maxLength={10}
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono uppercase focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 placeholder:normal-case"
                    />
                    <select
                        value={newDomainId}
                        onChange={(e) => setNewDomainId(Number(e.target.value))}
                        className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                        {MARKETPLACES.map((mp) => (
                            <option key={mp.domainId} value={mp.domainId}>
                                {mp.label}
                            </option>
                        ))}
                    </select>
                    <Button
                        onClick={handleAdd}
                        disabled={adding || !newAsin.trim()}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white cursor-pointer"
                    >
                        {adding ? (
                            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <IconPlus className="w-4 h-4 mr-2" />
                        )}
                        Surveiller cet ASIN
                    </Button>
                </div>

                {/* Tableau */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    {watches.length === 0 ? (
                        <div className="p-12 text-center">
                            <IconPackageOff className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-400 text-sm">Aucun ASIN surveillé pour le moment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="p-3 text-left">Produit</th>
                                        <th className="p-3">Marketplace</th>
                                        <th className="p-3">Amazon vendeur</th>
                                        <th className="p-3">Prix</th>
                                        <th className="p-3">Dernière vérif</th>
                                        <th className="p-3">Alerte restock</th>
                                        <th className="p-3">Alerte rupture</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {watches.map((watch) => {
                                        const productUrl = amazonUrl(watch.asin, watch.domainId);
                                        return (
                                            <tr key={watch.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-3 max-w-md">
                                                    <div className="flex items-start gap-3">
                                                        {watch.imageUrl ? (
                                                            <a
                                                                href={productUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="shrink-0 block w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 relative"
                                                            >
                                                                <Image src={watch.imageUrl} alt="" fill sizes="48px" className="object-contain" />
                                                            </a>
                                                        ) : (
                                                            <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-800 border border-slate-700" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <a
                                                                href={productUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-start gap-1.5 text-white hover:text-amber-400 transition-colors group"
                                                            >
                                                                <span className="line-clamp-2 text-left">{watch.title || watch.asin}</span>
                                                                <IconExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                                                            </a>
                                                            <code className="text-[10px] text-slate-500 font-mono">{watch.asin}</code>
                                                            {!watch.trackingActive && (
                                                                <Badge className="ml-2 bg-rose-500/20 text-rose-300 border-rose-500/30 text-[9px]">
                                                                    Tracking KO
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 font-mono">
                                                        {watch.marketplaceCode}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {watch.amazonAvailable ? (
                                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                                            ✅ En stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                                                            ❌ Pas vendeur
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3 text-slate-300 whitespace-nowrap text-center">
                                                    {formatPrice(watch.lastPrice)}
                                                </td>
                                                <td className="p-3 text-slate-400 text-xs whitespace-nowrap text-center">
                                                    {timeAgo(watch.lastChecked)}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Switch
                                                            checked={watch.alertRestock}
                                                            onCheckedChange={(v) => handleToggle(watch, "alertRestock", v)}
                                                        />
                                                        {watch.alertRestock ? (
                                                            <IconBell className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <IconBellOff className="w-4 h-4 text-slate-600" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Switch
                                                            checked={watch.alertOutOfStock}
                                                            onCheckedChange={(v) => handleToggle(watch, "alertOutOfStock", v)}
                                                        />
                                                        {watch.alertOutOfStock ? (
                                                            <IconAlertTriangle className="w-4 h-4 text-rose-400" />
                                                        ) : (
                                                            <IconBellOff className="w-4 h-4 text-slate-600" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <button
                                                            onClick={() => handleRefresh(watch)}
                                                            disabled={refreshingId === watch.id}
                                                            aria-label="Rafraîchir"
                                                            title="Refresh manuel (1 token Keepa)"
                                                            className="p-2 hover:bg-amber-500/10 rounded-lg text-slate-500 hover:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
                                                        >
                                                            {refreshingId === watch.id ? (
                                                                <IconLoader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <IconRefresh className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(watch)}
                                                            aria-label="Supprimer"
                                                            className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: "slate" | "emerald" | "rose" | "amber";
}) {
    const colorClasses = {
        slate: "text-slate-300",
        emerald: "text-emerald-400",
        rose: "text-rose-400",
        amber: "text-amber-400",
    }[color];
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
            <p className={`text-3xl font-black mt-1 ${colorClasses}`}>{value}</p>
        </div>
    );
}
