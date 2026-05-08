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
    IconSparkles,
    IconTrash,
} from "@tabler/icons-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { addEverwishUrl, deleteEverwishProduct, EverwishProduct, toggleEverwishAlert, triggerEverwishScan } from "../actions";
import { useRouter } from "next/navigation";

type Filter = "all" | "outOfStock" | "alertActive";
type WholesaleFilter = "all" | "wholesale" | "retail";

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

interface Props {
    initialProducts: EverwishProduct[];
}

export default function EverwishClient({ initialProducts }: Props) {
    const router = useRouter();
    const [products, setProducts] = useState<EverwishProduct[]>(initialProducts);
    const [filter, setFilter] = useState<Filter>("all");
    const [wholesaleFilter, setWholesaleFilter] = useState<WholesaleFilter>("wholesale");
    const [search, setSearch] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [scanning, startScan] = useTransition();
    const [adding, startAdd] = useTransition();

    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter((p) => p.inStock).length;
        const outOfStock = total - inStock;
        const activeAlerts = products.filter((p) => p.alertRestock || p.alertOutOfStock).length;
        return { total, inStock, outOfStock, activeAlerts };
    }, [products]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return products.filter((p) => {
            if (wholesaleFilter === "wholesale" && !p.wholesale) return false;
            if (wholesaleFilter === "retail" && p.wholesale) return false;
            if (filter === "outOfStock" && p.inStock) return false;
            if (filter === "alertActive" && !(p.alertRestock || p.alertOutOfStock)) return false;
            if (q && !p.title.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [products, filter, wholesaleFilter, search]);

    const handleScan = () => {
        startScan(async () => {
            const result = await triggerEverwishScan();
            if (!result.success) {
                toast.error(result.error || "Erreur de scan");
                return;
            }
            toast.success(result.message || "Scan terminé");
            router.refresh();
        });
    };

    const handleAdd = () => {
        const url = newUrl.trim();
        if (!url) return;
        startAdd(async () => {
            const result = await addEverwishUrl(url);
            if (!result.success) {
                toast.error(result.error || "Erreur ajout URL");
                return;
            }
            toast.success("URL ajoutée à la surveillance");
            setNewUrl("");
            router.refresh();
        });
    };

    const handleToggle = async (product: EverwishProduct, field: "alertRestock" | "alertOutOfStock", value: boolean) => {
        // Optimiste
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: value } : p)));
        const result = await toggleEverwishAlert(product.id, field, value);
        if (!result.success) {
            toast.error(result.error || "Erreur mise à jour");
            // Rollback
            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: !value } : p)));
        }
    };

    const handleDelete = async (product: EverwishProduct) => {
        if (!confirm(`Supprimer "${product.title}" de la surveillance ?`)) return;
        const result = await deleteEverwishProduct(product.id);
        if (!result.success) {
            toast.error(result.error || "Erreur suppression");
            return;
        }
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        toast.success("Produit supprimé");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-900/40">
                            <IconSparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Ever Wish</h1>
                            <p className="text-slate-400">Surveillance stock ever-wish.com</p>
                        </div>
                    </div>
                    <Button onClick={handleScan} disabled={scanning} className="bg-white text-black hover:bg-fuchsia-500 hover:text-white cursor-pointer">
                        {scanning ? <IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> : <IconRefresh className="w-4 h-4 mr-2" />}
                        Scanner maintenant
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total surveillés" value={stats.total} color="slate" />
                    <StatCard label="En stock" value={stats.inStock} color="emerald" />
                    <StatCard label="En rupture" value={stats.outOfStock} color="rose" />
                    <StatCard label="Alertes actives" value={stats.activeAlerts} color="fuchsia" />
                </div>

                {/* Ajout URL */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
                    <input
                        type="url"
                        placeholder="https://ever-wish.com/wholesale-takara-tomy-..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd();
                        }}
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600"
                    />
                    <Button onClick={handleAdd} disabled={adding || !newUrl.trim()} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer">
                        {adding ? <IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> : <IconPlus className="w-4 h-4 mr-2" />}
                        Ajouter URL
                    </Button>
                </div>

                {/* Recherche par titre */}
                <div className="mb-4">
                    <input
                        type="search"
                        placeholder="Rechercher par titre…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <FilterPill active={wholesaleFilter === "wholesale"} onClick={() => setWholesaleFilter("wholesale")}>Wholesale uniquement</FilterPill>
                    <FilterPill active={wholesaleFilter === "retail"} onClick={() => setWholesaleFilter("retail")}>Retail uniquement</FilterPill>
                    <FilterPill active={wholesaleFilter === "all"} onClick={() => setWholesaleFilter("all")}>Tous</FilterPill>
                    <span className="w-px bg-slate-800 mx-1" />
                    <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Tous statuts</FilterPill>
                    <FilterPill active={filter === "outOfStock"} onClick={() => setFilter("outOfStock")}>En rupture</FilterPill>
                    <FilterPill active={filter === "alertActive"} onClick={() => setFilter("alertActive")}>Alerte active</FilterPill>
                </div>

                {/* Tableau produits */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <IconPackageOff className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-400 text-sm">Aucun produit ne correspond aux filtres.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="p-3">Produit</th>
                                        <th className="p-3">Prix</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3">Dernière vérif</th>
                                        <th className="p-3">Alerte restock</th>
                                        <th className="p-3">Alerte rupture</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filtered.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-3 max-w-md">
                                                <a href={product.url} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-white hover:text-fuchsia-400 transition-colors group">
                                                    <span className="line-clamp-2">{product.title || product.url}</span>
                                                    <IconExternalLink className="w-3 h-3 text-slate-500 group-hover:text-fuchsia-400 shrink-0 mt-0.5" />
                                                </a>
                                                {product.wholesale && <Badge className="mt-1 bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 text-[9px]">Wholesale</Badge>}
                                            </td>
                                            <td className="p-3 text-slate-300 whitespace-nowrap">{product.priceText || "—"}</td>
                                            <td className="p-3">
                                                {product.inStock ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">En stock</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">Rupture</Badge>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-400 text-xs whitespace-nowrap">{timeAgo(product.lastChecked)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={product.alertRestock} onCheckedChange={(v) => handleToggle(product, "alertRestock", v)} disabled={product.inStock} />
                                                    {product.alertRestock ? <IconBell className="w-4 h-4 text-emerald-400" /> : <IconBellOff className="w-4 h-4 text-slate-600" />}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch checked={product.alertOutOfStock} onCheckedChange={(v) => handleToggle(product, "alertOutOfStock", v)} disabled={!product.inStock} />
                                                    {product.alertOutOfStock ? <IconAlertTriangle className="w-4 h-4 text-rose-400" /> : <IconBellOff className="w-4 h-4 text-slate-600" />}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <button onClick={() => handleDelete(product)} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer">
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "slate" | "emerald" | "rose" | "fuchsia" }) {
    const colorClasses = {
        slate: "text-slate-300",
        emerald: "text-emerald-400",
        rose: "text-rose-400",
        fuchsia: "text-fuchsia-400",
    }[color];
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
            <p className={`text-3xl font-black mt-1 ${colorClasses}`}>{value}</p>
        </div>
    );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                active ? "bg-fuchsia-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
            {children}
        </button>
    );
}
