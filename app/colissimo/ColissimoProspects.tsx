"use client";

import Selecteur from "@/components/selecteur";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
    IProspectColissimo,
    PROSPECT_STATUS_LABEL,
    PROSPECT_STATUSES,
    TProspectStatus,
} from "@/library/types/prospectColissimo";
import {
    Archive,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    ExternalLink,
    MessageSquare,
    Pencil,
    Plus,
    Search,
    Sparkles,
    StickyNote,
    Trash2,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    createProspect,
    findProspectByInput,
    removeProspect,
    updateProspectStatus,
} from "./actions";
import ContactScanner from "./ContactScanner";
import { cleanDomainFromInput } from "./domain";
import EditProspectDialog from "./EditProspectDialog";
import TagListInput, { validateEmail } from "./TagListInput";

interface Props {
    initialProspects: IProspectColissimo[];
}

const STATUS_OPTIONS = PROSPECT_STATUSES.map((s) => ({ value: s, label: PROSPECT_STATUS_LABEL[s] }));
const STATUS_FILTER_OPTIONS = [{ value: "all", label: "Tous les statuts" }, ...STATUS_OPTIONS];

const STATUS_META: Record<TProspectStatus, { pill: string; dot: string; icon: React.ElementType }> = {
    a_prospecter: {
        pill: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        dot: "bg-emerald-500",
        icon: Sparkles,
    },
    en_attente: {
        pill: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        dot: "bg-amber-500",
        icon: Clock,
    },
    archive: {
        pill: "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200",
        dot: "bg-zinc-400",
        icon: Archive,
    },
};

type SortKey = "domain" | "status" | "updated" | "created";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 20;

function StatusPill({ status, className = "" }: { status: TProspectStatus; className?: string }) {
    const meta = STATUS_META[status];
    const Icon = meta.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.pill} ${className}`}
        >
            <Icon className="h-3 w-3" />
            {PROSPECT_STATUS_LABEL[status]}
        </span>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    accent: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xl font-semibold tabular-nums">{value}</span>
            </div>
        </div>
    );
}

// Toggle add/remove dans une liste (insensible à la casse)
function toggleIn(list: string[], value: string): string[] {
    const lower = value.toLowerCase();
    const idx = list.findIndex((v) => v.toLowerCase() === lower);
    if (idx >= 0) {
        const next = list.slice();
        next.splice(idx, 1);
        return next;
    }
    return [...list, value];
}

// Merge des valeurs dans la liste sans doublons (insensible à la casse)
function mergeIn(list: string[], values: string[]): string[] {
    const lowers = new Set(list.map((v) => v.toLowerCase()));
    const next = list.slice();
    for (const v of values) {
        const k = v.toLowerCase();
        if (!lowers.has(k)) {
            next.push(v);
            lowers.add(k);
        }
    }
    return next;
}

export default function ColissimoProspects({ initialProspects }: Props) {
    const [prospects, setProspects] = useState(initialProspects);

    const [rawInput, setRawInput] = useState("");
    const [extractedDomain, setExtractedDomain] = useState<string | null>(null);
    const [lookup, setLookup] = useState<{ state: "idle" | "searching" | "found" | "missing"; prospect: IProspectColissimo | null }>({
        state: "idle",
        prospect: null,
    });
    const [newEmails, setNewEmails] = useState<string[]>([]);
    const [newPhones, setNewPhones] = useState<string[]>([]);
    const [newStatus, setNewStatus] = useState<TProspectStatus>("a_prospecter");
    const [newNotes, setNewNotes] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TProspectStatus | "all">("all");
    const [sortKey, setSortKey] = useState<SortKey>("updated");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [page, setPage] = useState(1);

    const [editing, setEditing] = useState<IProspectColissimo | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setExtractedDomain(cleanDomainFromInput(rawInput));
    }, [rawInput]);

    useEffect(() => {
        if (!extractedDomain) {
            setLookup({ state: "idle", prospect: null });
            return;
        }
        setLookup({ state: "searching", prospect: null });
        const timer = setTimeout(async () => {
            const res = await findProspectByInput(extractedDomain);
            if (res.prospect) {
                setLookup({ state: "found", prospect: res.prospect });
            } else {
                setLookup({ state: "missing", prospect: null });
                setNewEmails([]);
                setNewPhones([]);
                setNewStatus("a_prospecter");
                setNewNotes("");
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [extractedDomain]);

    useEffect(() => setPage(1), [search, statusFilter]);

    const resetSearchBar = () => {
        setRawInput("");
        setExtractedDomain(null);
        setLookup({ state: "idle", prospect: null });
        setNewEmails([]);
        setNewPhones([]);
        setNewStatus("a_prospecter");
        setNewNotes("");
    };

    const handleCreate = () => {
        if (!extractedDomain) return;
        startTransition(async () => {
            const res = await createProspect({
                domain: extractedDomain,
                emails: newEmails,
                phones: newPhones,
                status: newStatus,
                notes: newNotes.trim(),
            });
            if (res.success && res.prospect) {
                toast.success("Prospect ajouté");
                setProspects((prev) => [res.prospect!, ...prev]);
                resetSearchBar();
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const handleStatusChange = (id: string, next: TProspectStatus) => {
        startTransition(async () => {
            const res = await updateProspectStatus(id, next);
            if (res.success) {
                setProspects((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, status: next, updated: new Date().toISOString() } : p))
                );
                toast.success("Statut mis à jour");
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const handleRemove = (p: IProspectColissimo) => {
        if (!confirm(`Supprimer ${p.domain} ?`)) return;
        startTransition(async () => {
            const res = await removeProspect(p.id);
            if (res.success) {
                setProspects((prev) => prev.filter((x) => x.id !== p.id));
                toast.success("Prospect supprimé");
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const handleEdit = (p: IProspectColissimo) => {
        setEditing(p);
        setEditOpen(true);
    };

    const handleSaved = (updated: IProspectColissimo) => {
        setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        if (lookup.state === "found" && lookup.prospect?.id === updated.id) {
            setLookup({ state: "found", prospect: updated });
        }
    };

    const counts = useMemo(() => {
        const base: Record<TProspectStatus, number> = { a_prospecter: 0, en_attente: 0, archive: 0 };
        for (const p of prospects) base[p.status]++;
        return base;
    }, [prospects]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return prospects.filter((p) => {
            if (statusFilter !== "all" && p.status !== statusFilter) return false;
            if (!q) return true;
            return (
                p.domain.toLowerCase().includes(q) ||
                p.emails.some((e) => e.toLowerCase().includes(q)) ||
                p.phones.some((ph) => ph.toLowerCase().includes(q)) ||
                (p.notes ?? "").toLowerCase().includes(q)
            );
        });
    }, [prospects, search, statusFilter]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        const dir = sortDir === "asc" ? 1 : -1;
        arr.sort((a, b) => {
            const av = (a[sortKey] ?? "") as string;
            const bv = (b[sortKey] ?? "") as string;
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
        return arr;
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir(key === "updated" || key === "created" ? "desc" : "asc");
        }
    };

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key) return <ArrowUpDown className="inline h-3 w-3 opacity-40" />;
        return sortDir === "asc" ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />;
    };

    const formatDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                        <Users className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Prospects Colissimo</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                    Suivi des domaines à démarcher, en attente de réponse ou archivés.
                </p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Users} label="Total" value={prospects.length} accent="bg-sky-50 text-sky-600" />
                <KpiCard icon={Sparkles} label="À prospecter" value={counts.a_prospecter} accent="bg-emerald-50 text-emerald-600" />
                <KpiCard icon={Clock} label="En attente" value={counts.en_attente} accent="bg-amber-50 text-amber-600" />
                <KpiCard icon={Archive} label="Archivés" value={counts.archive} accent="bg-zinc-100 text-zinc-600" />
            </div>

            {/* Recherche / Ajout */}
            <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="border-b bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-4">
                    <h2 className="text-sm font-semibold tracking-wide">Rechercher ou ajouter un domaine</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Collez une URL, un domaine ou un texte — le domaine est détecté automatiquement.
                    </p>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <Input
                        placeholder="https://www.exemple.fr/contact"
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                        className="w-full h-11 text-base"
                    />

                    {rawInput && !extractedDomain && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            Aucun domaine valide détecté dans ce texte.
                        </div>
                    )}

                    {extractedDomain && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Domaine détecté :</span>
                            <a
                                href={`https://${extractedDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono font-semibold bg-muted px-2 py-0.5 rounded hover:bg-sky-100 hover:text-sky-800"
                            >
                                {extractedDomain}
                                <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                        </div>
                    )}

                    {lookup.state === "found" && lookup.prospect && (
                        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                                            Déjà en base
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={`https://${lookup.prospect.domain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-mono text-lg font-semibold text-emerald-900 hover:underline"
                                        >
                                            {lookup.prospect.domain}
                                            <ExternalLink className="h-4 w-4 opacity-70" />
                                        </a>
                                        <StatusPill status={lookup.prospect.status} />
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(lookup.prospect!)}>
                                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Éditer
                                </Button>
                            </div>
                            <ContactLists emails={lookup.prospect.emails} phones={lookup.prospect.phones} />
                            {lookup.prospect.notes && (
                                <div className="flex items-start gap-2 text-sm rounded-lg bg-white/60 p-3 border border-emerald-100">
                                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span className="whitespace-pre-wrap">{lookup.prospect.notes}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {lookup.state === "missing" && extractedDomain && (
                        <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-sky-600" />
                                <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                                    Nouveau prospect
                                </span>
                            </div>
                            <ContactScanner
                                domain={extractedDomain}
                                selectedEmails={newEmails}
                                selectedPhones={newPhones}
                                onToggleEmail={(v) => setNewEmails((prev) => toggleIn(prev, v))}
                                onTogglePhone={(v) => setNewPhones((prev) => toggleIn(prev, v))}
                                onAddAllEmails={(list) => setNewEmails((prev) => mergeIn(prev, list))}
                                onAddAllPhones={(list) => setNewPhones((prev) => mergeIn(prev, list))}
                            />
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                        Emails ({newEmails.length})
                                    </label>
                                    <TagListInput
                                        values={newEmails}
                                        onChange={setNewEmails}
                                        placeholder="contact@exemple.fr"
                                        type="email"
                                        validate={validateEmail}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                        Téléphones ({newPhones.length})
                                    </label>
                                    <TagListInput
                                        values={newPhones}
                                        onChange={setNewPhones}
                                        placeholder="+33 6 00 00 00 00"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                        Statut
                                    </label>
                                    <Selecteur
                                        value={newStatus}
                                        onChange={(v) => setNewStatus(v as TProspectStatus)}
                                        array={STATUS_OPTIONS}
                                        placeholder="Statut"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <Textarea
                                placeholder="Notes (optionnel)"
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={resetSearchBar} disabled={isPending}>
                                    Annuler
                                </Button>
                                <Button onClick={handleCreate} disabled={isPending}>
                                    <Plus className="h-4 w-4 mr-1.5" /> Ajouter à la base
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Liste */}
            <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="border-b px-5 py-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold tracking-wide">Tous les prospects</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
                    </span>
                </div>

                <div className="px-5 py-4 border-b bg-muted/30 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par domaine, email, téléphone, notes…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-full bg-background"
                        />
                    </div>
                    <Selecteur
                        value={statusFilter}
                        onChange={(v) => setStatusFilter(v as TProspectStatus | "all")}
                        array={STATUS_FILTER_OPTIONS}
                        placeholder="Filtre statut"
                        className="w-full md:w-64"
                    />
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead
                                    onClick={() => toggleSort("domain")}
                                    className="cursor-pointer select-none text-xs uppercase tracking-wider"
                                >
                                    Domaine {sortIcon("domain")}
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider">Emails</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider">Téléphones</TableHead>
                                <TableHead
                                    onClick={() => toggleSort("status")}
                                    className="cursor-pointer select-none text-xs uppercase tracking-wider"
                                >
                                    Statut {sortIcon("status")}
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider">Notes</TableHead>
                                <TableHead
                                    onClick={() => toggleSort("updated")}
                                    className="cursor-pointer select-none text-xs uppercase tracking-wider"
                                >
                                    Maj {sortIcon("updated")}
                                </TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-16">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-30" />
                                            <span>Aucun prospect ne correspond</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.map((p) => {
                                const meta = STATUS_META[p.status];
                                return (
                                    <TableRow key={p.id} className="transition hover:bg-muted/30">
                                        <TableCell className="font-mono font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                                                <a
                                                    href={`https://${p.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-center gap-1 hover:text-sky-700 hover:underline"
                                                    title="Ouvrir le site"
                                                >
                                                    {p.domain}
                                                    <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <ContactListCell items={p.emails} kind="email" />
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <ContactListCell items={p.phones} kind="phone" />
                                        </TableCell>
                                        <TableCell>
                                            <Selecteur
                                                value={p.status}
                                                onChange={(v) => handleStatusChange(p.id, v as TProspectStatus)}
                                                array={STATUS_OPTIONS}
                                                placeholder="Statut"
                                                className="w-full min-w-[150px]"
                                            />
                                        </TableCell>
                                        <TableCell
                                            className="max-w-[240px] truncate text-sm text-muted-foreground"
                                            title={p.notes || ""}
                                        >
                                            {p.notes || <span className="opacity-50">—</span>}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground tabular-nums">
                                            {formatDate(p.updated)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(p)}
                                                    disabled={isPending}
                                                    title="Éditer"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleRemove(p)}
                                                    disabled={isPending}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t px-5 py-3 flex items-center justify-between gap-2 bg-muted/20">
                        <div className="text-xs text-muted-foreground">
                            Page <span className="font-semibold">{safePage}</span> sur {totalPages}
                        </div>
                        <div className="flex gap-1">
                            <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            <EditProspectDialog prospect={editing} open={editOpen} onOpenChange={setEditOpen} onSaved={handleSaved} />
        </div>
    );
}

// Affichage compact dans une cellule de table : montre jusqu'à 2 items + compteur
function ContactListCell({ items, kind }: { items: string[]; kind: "email" | "phone" }) {
    if (!items || items.length === 0) return <span className="text-muted-foreground">—</span>;
    const prefix = kind === "email" ? "mailto:" : "tel:";
    const toShow = items.slice(0, 2);
    const more = items.length - toShow.length;
    return (
        <div className="flex flex-col gap-0.5" title={items.join("\n")}>
            {toShow.map((v, i) => (
                <a
                    key={`${v}-${i}`}
                    href={`${prefix}${v}`}
                    className="text-sky-700 hover:underline font-mono text-xs truncate max-w-[220px]"
                >
                    {v}
                </a>
            ))}
            {more > 0 && <span className="text-[11px] text-muted-foreground">+ {more} autre{more > 1 ? "s" : ""}</span>}
        </div>
    );
}

// Affichage complet dans la carte "Déjà en base"
function ContactLists({ emails, phones }: { emails: string[]; phones: string[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Emails ({emails.length})
                </span>
                {emails.length === 0 ? (
                    <em className="text-muted-foreground text-xs">aucun</em>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {emails.map((e, i) => (
                            <li key={`${e}-${i}`}>
                                <a href={`mailto:${e}`} className="font-mono text-xs text-sky-700 hover:underline">
                                    {e}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Téléphones ({phones.length})
                </span>
                {phones.length === 0 ? (
                    <em className="text-muted-foreground text-xs">aucun</em>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {phones.map((ph, i) => (
                            <li key={`${ph}-${i}`}>
                                <a href={`tel:${ph}`} className="font-mono text-xs text-sky-700 hover:underline">
                                    {ph}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
