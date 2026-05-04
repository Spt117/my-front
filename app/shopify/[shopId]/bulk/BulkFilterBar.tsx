"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useUserStore from "@/library/stores/storeUser";
import {
    Ban,
    Building2,
    Check,
    CircleDollarSign,
    CircleSlash2,
    Filter,
    Hash,
    LayoutGrid,
    Plus,
    RefreshCw,
    Search,
    Tag,
    Type,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BulkFilters, BulkSort, BulkSortKey, BulkStatus, hasActiveFilters } from "./bulkQuery";
import useBulkStore from "./storeBulk";

// ─── Helpers ────────────────────────────────────────────────────────────────

const SORT_LABELS: Record<BulkSortKey, string> = {
    CREATED_AT: "Date de création",
    UPDATED_AT: "Date de mise à jour",
    TITLE: "Titre",
    VENDOR: "Vendeur",
    PRODUCT_TYPE: "Type de produit",
};

const STATUS_LABELS: Record<BulkStatus, string> = {
    ACTIVE: "Actif",
    DRAFT: "Brouillon",
    ARCHIVED: "Archivé",
};

// ─── Hook : suggestions de tags via le socket cache ─────────────────────────

function useTagSuggestions(query: string) {
    const { socket } = useUserStore();
    const { shopifyBoutique } = useShopifyStore();
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!socket) return;
        const handler = (tags: string[]) => setSuggestions(tags || []);
        socket.on("tagSuggestions", handler);
        return () => {
            socket.off("tagSuggestions", handler);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !shopifyBoutique?.domain) return;
        const q = query.trim();
        if (!q) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(() => socket.emit("searchTags", q, shopifyBoutique.domain), 250);
        return () => clearTimeout(timer);
    }, [query, socket, shopifyBoutique?.domain]);

    return suggestions;
}

// ─── Sous-composant : Popover ajout d'un filtre ─────────────────────────────

interface AddFilterMenuProps {
    onPick: (key: FilterKey) => void;
    activeKeys: Set<FilterKey>;
}

type FilterKey = "text" | "tags" | "price" | "status" | "vendor" | "productType" | "missingChannels";

const FILTER_ITEMS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
    { key: "text", label: "Recherche texte", icon: <Search size={14} /> },
    { key: "tags", label: "Tags", icon: <Tag size={14} /> },
    { key: "price", label: "Prix", icon: <CircleDollarSign size={14} /> },
    { key: "status", label: "Statut", icon: <CircleSlash2 size={14} /> },
    { key: "vendor", label: "Vendeur", icon: <Building2 size={14} /> },
    { key: "productType", label: "Type de produit", icon: <Type size={14} /> },
    { key: "missingChannels", label: "Canaux manquants", icon: <LayoutGrid size={14} /> },
];

function AddFilterMenu({ onPick, activeKeys }: AddFilterMenuProps) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-dashed">
                    <Plus size={14} />
                    Filtre
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-2 py-1.5">Ajouter un filtre</div>
                <div className="flex flex-col">
                    {FILTER_ITEMS.map((it) => {
                        const isActive = activeKeys.has(it.key);
                        return (
                            <button
                                key={it.key}
                                type="button"
                                onClick={() => {
                                    onPick(it.key);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors text-left"
                            >
                                <span className="text-slate-500">{it.icon}</span>
                                <span className="flex-1">{it.label}</span>
                                {isActive && <Check size={14} className="text-emerald-600" />}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─── Sous-composant : Popover de configuration de chaque filtre ─────────────

interface ChipProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClear?: () => void;
}

function ChipShell({ icon, label, active, onClear, children }: React.PropsWithChildren<ChipProps>) {
    return (
        <div
            className={`group inline-flex items-center gap-1 rounded-full border text-xs px-2 py-1 transition-colors ${
                active ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
        >
            <span className="text-slate-500">{icon}</span>
            <span className="font-medium">{label}</span>
            {children}
            {onClear && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="ml-1 -mr-0.5 p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                    aria-label="Retirer ce filtre"
                >
                    <X size={11} />
                </button>
            )}
        </div>
    );
}

// — Texte —
function TextChipPopover({ filters, patch }: { filters: BulkFilters; patch: (p: Partial<BulkFilters>) => void }) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(filters.text);
    useEffect(() => {
        if (open) setDraft(filters.text);
    }, [open, filters.text]);
    const apply = () => {
        patch({ text: draft });
        setOpen(false);
    };
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button">
                    <ChipShell icon={<Search size={12} />} label={filters.text ? `« ${filters.text} »` : "Recherche…"} active={!!filters.text} onClear={filters.text ? () => patch({ text: "" }) : undefined}>
                        {!filters.text && <Plus size={11} className="text-slate-400" />}
                    </ChipShell>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3 space-y-2">
                <Label htmlFor="bulk-text">Recherche dans titre, SKU, vendeur</Label>
                <Input
                    id="bulk-text"
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") apply();
                        if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder="ex: Pikachu"
                />
                <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={apply}>
                        Appliquer
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// — Tags (include avec ET/OU + exclude) —
function TagsChipPopover({ filters, patch }: { filters: BulkFilters; patch: (p: Partial<BulkFilters>) => void }) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("");
    const suggestions = useTagSuggestions(draft);
    const isActive = filters.tagsInclude.length > 0 || filters.tagsExclude.length > 0;

    const addInclude = (tag: string) => {
        const t = tag.trim();
        if (!t) return;
        if (filters.tagsInclude.includes(t) || filters.tagsExclude.includes(t)) return;
        patch({ tagsInclude: [...filters.tagsInclude, t] });
        setDraft("");
    };
    const addExclude = (tag: string) => {
        const t = tag.trim();
        if (!t) return;
        if (filters.tagsInclude.includes(t) || filters.tagsExclude.includes(t)) return;
        patch({ tagsExclude: [...filters.tagsExclude, t] });
        setDraft("");
    };
    const removeInclude = (tag: string) => patch({ tagsInclude: filters.tagsInclude.filter((t) => t !== tag) });
    const removeExclude = (tag: string) => patch({ tagsExclude: filters.tagsExclude.filter((t) => t !== tag) });

    const labelParts: string[] = [];
    if (filters.tagsInclude.length > 0) labelParts.push(`${filters.tagsInclude.length} ${filters.tagsIncludeOp}`);
    if (filters.tagsExclude.length > 0) labelParts.push(`-${filters.tagsExclude.length}`);
    const chipLabel = isActive ? `Tags : ${labelParts.join(" / ")}` : "Tags…";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button">
                    <ChipShell
                        icon={<Tag size={12} />}
                        label={chipLabel}
                        active={isActive}
                        onClear={isActive ? () => patch({ tagsInclude: [], tagsExclude: [] }) : undefined}
                    >
                        {!isActive && <Plus size={11} className="text-slate-400" />}
                    </ChipShell>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-96 p-3 space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="bulk-tag-input">Tags à inclure</Label>
                        {filters.tagsInclude.length > 1 && (
                            <ToggleGroup
                                type="single"
                                size="sm"
                                value={filters.tagsIncludeOp}
                                onValueChange={(v) => v && patch({ tagsIncludeOp: v as "AND" | "OR" })}
                                className="h-7"
                            >
                                <ToggleGroupItem value="AND" className="text-[11px] px-2.5 h-7" aria-label="Tous les tags requis">
                                    ET
                                </ToggleGroupItem>
                                <ToggleGroupItem value="OR" className="text-[11px] px-2.5 h-7" aria-label="Au moins un tag">
                                    OU
                                </ToggleGroupItem>
                            </ToggleGroup>
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            id="bulk-tag-input"
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && draft.trim()) {
                                    e.preventDefault();
                                    addInclude(draft);
                                }
                                if (e.key === "Escape") setOpen(false);
                            }}
                            placeholder="Tape un tag puis Entrée"
                        />
                        {suggestions.length > 0 && draft.trim() && (
                            <ul className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {suggestions.slice(0, 12).map((s) => (
                                    <li key={s} className="flex items-center justify-between px-2 py-1 text-sm hover:bg-slate-50">
                                        <span className="truncate">{s}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => addInclude(s)}
                                                className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                title="Inclure"
                                            >
                                                Inclure
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addExclude(s)}
                                                className="text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                                title="Exclure"
                                            >
                                                Exclure
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {filters.tagsInclude.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {filters.tagsInclude.map((t) => (
                                <Badge key={t} variant="secondary" className="bg-emerald-50 text-emerald-800 border border-emerald-200 gap-1 pr-1">
                                    <Tag size={10} />
                                    {t}
                                    <button type="button" onClick={() => removeInclude(t)} className="ml-0.5 p-0.5 rounded hover:bg-emerald-200/60">
                                        <X size={10} />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {filters.tagsExclude.length > 0 && (
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5">
                            <Ban size={12} className="text-rose-600" /> Tags à exclure
                        </Label>
                        <div className="flex flex-wrap gap-1">
                            {filters.tagsExclude.map((t) => (
                                <Badge key={t} variant="secondary" className="bg-rose-50 text-rose-800 border border-rose-200 gap-1 pr-1">
                                    <Ban size={10} />
                                    {t}
                                    <button type="button" onClick={() => removeExclude(t)} className="ml-0.5 p-0.5 rounded hover:bg-rose-200/60">
                                        <X size={10} />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-[11px] text-slate-500">
                    Astuce : tape Entrée pour inclure le tag courant. Utilise les boutons des suggestions pour basculer en exclusion.
                </p>
            </PopoverContent>
        </Popover>
    );
}

// — Prix —
function PriceChipPopover({ filters, patch }: { filters: BulkFilters; patch: (p: Partial<BulkFilters>) => void }) {
    const [open, setOpen] = useState(false);
    const [min, setMin] = useState<string>(filters.priceMin?.toString() ?? "");
    const [max, setMax] = useState<string>(filters.priceMax?.toString() ?? "");
    useEffect(() => {
        if (open) {
            setMin(filters.priceMin?.toString() ?? "");
            setMax(filters.priceMax?.toString() ?? "");
        }
    }, [open, filters.priceMin, filters.priceMax]);

    const apply = () => {
        const minN = min.trim() === "" ? null : Number(min);
        const maxN = max.trim() === "" ? null : Number(max);
        patch({
            priceMin: minN !== null && Number.isFinite(minN) ? minN : null,
            priceMax: maxN !== null && Number.isFinite(maxN) ? maxN : null,
        });
        setOpen(false);
    };

    const isActive = filters.priceMin !== null || filters.priceMax !== null;
    const label = isActive
        ? `${filters.priceMin ?? "?"}–${filters.priceMax ?? "∞"}`
        : "Prix…";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button">
                    <ChipShell
                        icon={<CircleDollarSign size={12} />}
                        label={label}
                        active={isActive}
                        onClear={isActive ? () => patch({ priceMin: null, priceMax: null }) : undefined}
                    >
                        {!isActive && <Plus size={11} className="text-slate-400" />}
                    </ChipShell>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3 space-y-3">
                <Label>Plage de prix (variante 0)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                        placeholder="Min"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") apply();
                        }}
                    />
                    <span className="text-slate-400">–</span>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                        placeholder="Max"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") apply();
                        }}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={apply}>
                        Appliquer
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// — Statut —
function StatusChipPopover({ filters, patch }: { filters: BulkFilters; patch: (p: Partial<BulkFilters>) => void }) {
    const isActive = filters.status !== null;
    const label = filters.status ? STATUS_LABELS[filters.status] : "Statut…";
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button type="button">
                    <ChipShell
                        icon={<CircleSlash2 size={12} />}
                        label={label}
                        active={isActive}
                        onClear={isActive ? () => patch({ status: null }) : undefined}
                    >
                        {!isActive && <Plus size={11} className="text-slate-400" />}
                    </ChipShell>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1.5">
                {(["ACTIVE", "DRAFT", "ARCHIVED"] as BulkStatus[]).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => patch({ status: filters.status === s ? null : s })}
                        className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 transition-colors ${
                            filters.status === s ? "text-blue-700 font-medium" : "text-slate-700"
                        }`}
                    >
                        {STATUS_LABELS[s]}
                        {filters.status === s && <Check size={14} className="text-blue-600" />}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    );
}

// — Vendor / Product type (champs texte simples) —
function TextLikeChipPopover({
    fieldKey,
    icon,
    label,
    placeholder,
    value,
    onChange,
}: {
    fieldKey: "vendor" | "productType";
    icon: React.ReactNode;
    label: string;
    placeholder: string;
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value ?? "");
    useEffect(() => {
        if (open) setDraft(value ?? "");
    }, [open, value]);
    const apply = () => {
        const t = draft.trim();
        onChange(t || null);
        setOpen(false);
    };
    const isActive = !!value;
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button">
                    <ChipShell
                        icon={icon}
                        label={isActive ? `${label} : ${value}` : `${label}…`}
                        active={isActive}
                        onClear={isActive ? () => onChange(null) : undefined}
                    >
                        {!isActive && <Plus size={11} className="text-slate-400" />}
                    </ChipShell>
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3 space-y-2">
                <Label htmlFor={`bulk-${fieldKey}`}>{label}</Label>
                <Input
                    id={`bulk-${fieldKey}`}
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") apply();
                        if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder={placeholder}
                />
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={apply}>
                        Appliquer
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// — Missing channels (toggle simple) —
function MissingChannelsChip({ filters, patch }: { filters: BulkFilters; patch: (p: Partial<BulkFilters>) => void }) {
    const isActive = filters.missingChannels;
    return (
        <button type="button" onClick={() => patch({ missingChannels: !isActive })}>
            <ChipShell
                icon={<LayoutGrid size={12} />}
                label={isActive ? "Manque un canal" : "Canaux manquants…"}
                active={isActive}
                onClear={isActive ? () => patch({ missingChannels: false }) : undefined}
            >
                {!isActive && <Plus size={11} className="text-slate-400" />}
            </ChipShell>
        </button>
    );
}

// ─── Composant principal ────────────────────────────────────────────────────

interface BulkFilterBarProps {
    totalCount: number;          // après tout filtrage (côté serveur + client)
    selectedCount: number;
    allSelected: boolean;
    onToggleSelectAll: () => void;
    loading?: boolean;
    onRefresh?: () => void;
}

export default function BulkFilterBar({ totalCount, selectedCount, allSelected, onToggleSelectAll, loading, onRefresh }: BulkFilterBarProps) {
    const filters = useBulkStore((s) => s.filters);
    const sort = useBulkStore((s) => s.sort);
    const patch = useBulkStore((s) => s.patchFilters);
    const setSort = useBulkStore((s) => s.setSort);
    const clear = useBulkStore((s) => s.clearFilters);

    const active = hasActiveFilters(filters);

    // Liste des chips à afficher : on n'affiche un chip que pour les filtres
    // actifs OU sélectionnés via le menu "+".
    const [pinnedKeys, setPinnedKeys] = useState<Set<FilterKey>>(new Set());
    const activeKeys = useMemo<Set<FilterKey>>(() => {
        const s = new Set<FilterKey>();
        if (filters.text.trim()) s.add("text");
        if (filters.tagsInclude.length > 0 || filters.tagsExclude.length > 0) s.add("tags");
        if (filters.priceMin !== null || filters.priceMax !== null) s.add("price");
        if (filters.status) s.add("status");
        if (filters.vendor) s.add("vendor");
        if (filters.productType) s.add("productType");
        if (filters.missingChannels) s.add("missingChannels");
        return s;
    }, [filters]);

    const visibleKeys = useMemo<Set<FilterKey>>(() => {
        const s = new Set<FilterKey>([...activeKeys, ...pinnedKeys]);
        return s;
    }, [activeKeys, pinnedKeys]);

    const handlePick = (k: FilterKey) => {
        // Pour missingChannels, on bascule directement.
        if (k === "missingChannels") {
            patch({ missingChannels: !filters.missingChannels });
            return;
        }
        setPinnedKeys((prev) => {
            const next = new Set(prev);
            next.add(k);
            return next;
        });
    };

    const clearAll = () => {
        clear();
        setPinnedKeys(new Set());
    };

    return (
        <div className="sticky top-12 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
            <div className="px-4 py-3 space-y-2">
                {/* Top row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm">
                        <Filter size={15} className="text-blue-600" />
                        <span className="font-semibold text-slate-800">{totalCount}</span>
                        <span className="text-slate-500">produit{totalCount > 1 ? "s" : ""}</span>
                        {loading && <RefreshCw size={13} className="ml-1 text-slate-400 animate-spin" />}
                    </div>

                    {totalCount > 0 && (
                        <Button variant={allSelected ? "default" : "outline"} size="sm" onClick={onToggleSelectAll} className="h-8">
                            {allSelected ? (
                                <>
                                    <X size={13} className="mr-1.5" />
                                    Désélectionner
                                </>
                            ) : (
                                <>
                                    <Check size={13} className="mr-1.5" />
                                    {selectedCount > 0 ? `Tout sélectionner (${totalCount})` : `Sélectionner les ${totalCount}`}
                                </>
                            )}
                        </Button>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        <Hash size={14} className="text-slate-400" />
                        <Select value={sort.sortKey} onValueChange={(v) => setSort({ ...sort, sortKey: v as BulkSortKey })}>
                            <SelectTrigger size="sm" className="w-[180px]" aria-label="Trier par">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(SORT_LABELS) as BulkSortKey[]).map((k) => (
                                    <SelectItem key={k} value={k}>
                                        {SORT_LABELS[k]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSort({ ...sort, reverse: !sort.reverse })}
                            className="h-8 px-2 text-slate-500"
                            title={sort.reverse ? "Décroissant" : "Croissant"}
                            aria-label="Inverser le tri"
                        >
                            {sort.reverse ? "↓" : "↑"}
                        </Button>
                        {onRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="h-8">
                                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Chips row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {visibleKeys.has("text") && <TextChipPopover filters={filters} patch={patch} />}
                    {visibleKeys.has("tags") && <TagsChipPopover filters={filters} patch={patch} />}
                    {visibleKeys.has("price") && <PriceChipPopover filters={filters} patch={patch} />}
                    {visibleKeys.has("status") && <StatusChipPopover filters={filters} patch={patch} />}
                    {visibleKeys.has("vendor") && (
                        <TextLikeChipPopover
                            fieldKey="vendor"
                            icon={<Building2 size={12} />}
                            label="Vendeur"
                            placeholder="ex: Pokémon Company"
                            value={filters.vendor}
                            onChange={(v) => patch({ vendor: v })}
                        />
                    )}
                    {visibleKeys.has("productType") && (
                        <TextLikeChipPopover
                            fieldKey="productType"
                            icon={<Type size={12} />}
                            label="Type"
                            placeholder="ex: Carte"
                            value={filters.productType}
                            onChange={(v) => patch({ productType: v })}
                        />
                    )}
                    {visibleKeys.has("missingChannels") && <MissingChannelsChip filters={filters} patch={patch} />}

                    <AddFilterMenu onPick={handlePick} activeKeys={activeKeys} />

                    {active && (
                        <Button variant="ghost" size="sm" onClick={clearAll} className="ml-1 h-7 text-xs text-slate-500 hover:text-rose-600">
                            <X size={12} className="mr-1" />
                            Vider
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
