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
    IconX,
} from "@tabler/icons-react";
import Image from "next/image";
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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkRunning, setBulkRunning] = useState(false);

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
            return;
        }
        const label = field === "alertRestock" ? "restock" : "rupture";
        const action = value ? "activée" : "désactivée";
        const titleShort = (product.title || product.url).slice(0, 60);
        if (value) {
            toast.success(`Alerte ${label} ${action}`, { description: titleShort });
        } else {
            toast(`Alerte ${label} ${action}`, { description: titleShort });
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
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
        });
        toast.success("Produit supprimé");
    };

    // ─── Sélection ───────────────────────────────────────────────────────────
    const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
    const toggleOne = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };
    const toggleAllFiltered = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                filteredIds.forEach((id) => next.delete(id));
            } else {
                filteredIds.forEach((id) => next.add(id));
            }
            return next;
        });
    };
    const clearSelection = () => setSelectedIds(new Set());

    // ─── Bulk actions ────────────────────────────────────────────────────────
    type BulkAction = "alertRestockOn" | "alertRestockOff" | "alertOutOfStockOn" | "alertOutOfStockOff" | "delete";

    const runBulk = async (action: BulkAction) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        if (action === "delete" && !confirm(`Supprimer ${ids.length} produit(s) de la surveillance ?`)) return;

        setBulkRunning(true);
        const targets = products.filter((p) => selectedIds.has(p.id));
        let okCount = 0;
        let skipCount = 0;
        let errCount = 0;

        const tasks = targets.map(async (product) => {
            try {
                if (action === "delete") {
                    const r = await deleteEverwishProduct(product.id);
                    if (!r.success) throw new Error(r.error);
                    okCount += 1;
                    return { id: product.id, deleted: true } as const;
                }
                if (action === "alertRestockOn" && product.inStock) { skipCount += 1; return null; }
                if (action === "alertOutOfStockOn" && !product.inStock) { skipCount += 1; return null; }

                const field = action.startsWith("alertRestock") ? "alertRestock" : "alertOutOfStock";
                const value = action.endsWith("On");
                const r = await toggleEverwishAlert(product.id, field, value);
                if (!r.success) throw new Error(r.error);
                okCount += 1;
                return { id: product.id, field, value } as const;
            } catch (e) {
                errCount += 1;
                console.error(`[bulk] ${action} ${product.url}:`, e);
                return null;
            }
        });
        const results = await Promise.all(tasks);
        setBulkRunning(false);

        // Mise à jour optimiste
        setProducts((prev) => {
            let next = [...prev];
            for (const r of results) {
                if (!r) continue;
                if ("deleted" in r) {
                    next = next.filter((p) => p.id !== r.id);
                } else {
                    next = next.map((p) => (p.id === r.id ? { ...p, [r.field]: r.value } : p));
                }
            }
            return next;
        });
        if (action === "delete") clearSelection();

        const labels: Record<BulkAction, string> = {
            alertRestockOn: "alertes restock activées",
            alertRestockOff: "alertes restock désactivées",
            alertOutOfStockOn: "alertes rupture activées",
            alertOutOfStockOff: "alertes rupture désactivées",
            delete: "produit(s) supprimé(s)",
        };
        const desc = [
            errCount > 0 ? `${errCount} erreur(s)` : null,
            skipCount > 0 ? `${skipCount} ignoré(s) (état incompatible)` : null,
        ].filter(Boolean).join(" · ");
        if (errCount > 0) {
            toast.error(`${okCount} ${labels[action]}`, { description: desc || undefined });
        } else {
            toast.success(`${okCount} ${labels[action]}`, { description: desc || undefined });
        }
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
                            else if (e.key === "Escape") setNewUrl("");
                        }}
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600"
                    />
                    <Button onClick={handleAdd} disabled={adding || !newUrl.trim()} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white cursor-pointer">
                        {adding ? <IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> : <IconPlus className="w-4 h-4 mr-2" />}
                        Ajouter URL
                    </Button>
                </div>

                {/* Recherche par titre */}
                <div className="mb-4 relative">
                    <input
                        type="search"
                        placeholder="Rechercher par titre…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setSearch("");
                        }}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-white text-sm focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-600 [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Effacer la recherche"
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    )}
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

                {/* Compteur résultats + Bulk action bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 pl-1">
                    <p className="text-slate-400 text-xs">
                        <span className="font-bold text-white">{filtered.length}</span>
                        {" "}produit{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
                        {filtered.length !== products.length && (
                            <span className="text-slate-500"> sur {products.length} au total</span>
                        )}
                    </p>
                    {selectedIds.size > 0 && (
                        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                            <span className="text-xs font-bold text-white px-2">{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
                            <BulkBtn disabled={bulkRunning} onClick={() => runBulk("alertRestockOn")}>🔔 Restock ON</BulkBtn>
                            <BulkBtn disabled={bulkRunning} onClick={() => runBulk("alertRestockOff")}>🔕 Restock OFF</BulkBtn>
                            <BulkBtn disabled={bulkRunning} onClick={() => runBulk("alertOutOfStockOn")}>🔔 Rupture ON</BulkBtn>
                            <BulkBtn disabled={bulkRunning} onClick={() => runBulk("alertOutOfStockOff")}>🔕 Rupture OFF</BulkBtn>
                            <BulkBtn disabled={bulkRunning} danger onClick={() => runBulk("delete")}>🗑 Supprimer</BulkBtn>
                            <button onClick={clearSelection} className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer">Effacer</button>
                        </div>
                    )}
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
                                        <th className="p-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={allFilteredSelected}
                                                onChange={toggleAllFiltered}
                                                aria-label="Tout sélectionner"
                                                className="w-4 h-4 accent-fuchsia-600 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-3 text-left">Produit</th>
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
                                        <tr key={product.id} className={`hover:bg-slate-800/30 transition-colors ${selectedIds.has(product.id) ? "bg-fuchsia-500/5" : ""}`}>
                                            <td className="p-3 text-center w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(product.id)}
                                                    onChange={(e) => toggleOne(product.id, e.target.checked)}
                                                    aria-label="Sélectionner"
                                                    className="w-4 h-4 accent-fuchsia-600 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-3 max-w-md">
                                                <div className="flex items-start gap-3">
                                                    {product.imageUrl ? (
                                                        <a href={product.url} target="_blank" rel="noreferrer" className="shrink-0 block w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 relative">
                                                            <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                                                        </a>
                                                    ) : (
                                                        <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-800 border border-slate-700" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <a href={product.url} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-white hover:text-fuchsia-400 transition-colors group">
                                                            <span className="line-clamp-2 text-left">{product.title || product.url}</span>
                                                            <IconExternalLink className="w-3 h-3 text-slate-500 group-hover:text-fuchsia-400 shrink-0 mt-0.5" />
                                                        </a>
                                                        {product.wholesale && <Badge className="mt-1 bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 text-[9px]">Wholesale</Badge>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-slate-300 whitespace-nowrap text-center">{product.priceText || "—"}</td>
                                            <td className="p-3 text-center">
                                                {product.inStock ? (
                                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">En stock</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">Rupture</Badge>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-400 text-xs whitespace-nowrap text-center">{timeAgo(product.lastChecked)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Switch checked={product.alertRestock} onCheckedChange={(v) => handleToggle(product, "alertRestock", v)} disabled={product.inStock} />
                                                    {product.alertRestock ? <IconBell className="w-4 h-4 text-emerald-400" /> : <IconBellOff className="w-4 h-4 text-slate-600" />}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Switch checked={product.alertOutOfStock} onCheckedChange={(v) => handleToggle(product, "alertOutOfStock", v)} disabled={!product.inStock} />
                                                    {product.alertOutOfStock ? <IconAlertTriangle className="w-4 h-4 text-rose-400" /> : <IconBellOff className="w-4 h-4 text-slate-600" />}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    aria-label="Supprimer le produit"
                                                    className="mx-auto p-3 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                                                >
                                                    <IconTrash className="w-5 h-5" />
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

function BulkBtn({ onClick, disabled, danger, children }: { onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                danger ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            }`}
        >
            {children}
        </button>
    );
}
