"use client";

import { Button } from "@/components/ui/button";
import {
    Check,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Link as LinkIcon,
    Loader2,
    Mail,
    Phone,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IScanContact, IScanResult, scanDomainContacts } from "./scan";

interface Props {
    domain: string | null;
    selectedEmails: string[];
    selectedPhones: string[];
    onToggleEmail: (email: string) => void;
    onTogglePhone: (phone: string) => void;
    autoScan?: boolean;
}

export default function ContactScanner({
    domain,
    selectedEmails,
    selectedPhones,
    onToggleEmail,
    onTogglePhone,
    autoScan = true,
}: Props) {
    const [result, setResult] = useState<IScanResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [triggeredDomain, setTriggeredDomain] = useState<string | null>(null);

    const runScan = async () => {
        if (!domain) return;
        setLoading(true);
        setTriggeredDomain(domain);
        try {
            const res = await scanDomainContacts(domain);
            setResult(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!autoScan) return;
        if (!domain) {
            setResult(null);
            setTriggeredDomain(null);
            return;
        }
        if (domain === triggeredDomain) return;
        runScan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain, autoScan]);

    if (!domain) return null;

    const nothingFound = result && !loading && result.emails.length === 0 && result.phones.length === 0;

    return (
        <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                        <Search className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                            Scan du site
                        </span>
                        {result && (
                            <span className="text-[11px] text-muted-foreground">
                                {result.pagesScanned.length} page{result.pagesScanned.length > 1 ? "s" : ""} ·{" "}
                                {result.emails.length} email{result.emails.length > 1 ? "s" : ""} ·{" "}
                                {result.phones.length} numéro{result.phones.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>
                <Button size="sm" variant="outline" onClick={runScan} disabled={loading} className="h-7 text-xs">
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-scanner
                        </>
                    )}
                </Button>
            </div>

            {loading && !result && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse en cours…
                </div>
            )}

            {result?.errors && result.errors.length > 0 && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 flex items-center gap-1.5">
                    <X className="h-3 w-3" />
                    {result.errors[0]}
                </div>
            )}

            {nothingFound && (
                <div className="text-sm text-muted-foreground italic">
                    Aucun email ou numéro trouvé sur les pages accessibles.
                </div>
            )}

            {result && result.emails.length > 0 && (
                <ContactSection
                    title="Emails détectés"
                    icon={Mail}
                    contacts={result.emails}
                    selected={selectedEmails.map((s) => s.toLowerCase())}
                    onToggle={onToggleEmail}
                />
            )}

            {result && result.phones.length > 0 && (
                <ContactSection
                    title="Téléphones détectés"
                    icon={Phone}
                    contacts={result.phones}
                    selected={selectedPhones.map((s) => s.toLowerCase())}
                    onToggle={onTogglePhone}
                    compareAsDisplay
                />
            )}
        </div>
    );
}

function ContactSection({
    title,
    icon: Icon,
    contacts,
    selected,
    onToggle,
    compareAsDisplay = false,
}: {
    title: string;
    icon: React.ElementType;
    contacts: IScanContact[];
    selected: string[];
    onToggle: (v: string) => void;
    compareAsDisplay?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="h-3 w-3" /> {title}
            </div>
            <div className="flex flex-col gap-1.5">
                {contacts.map((c) => {
                    const key = (compareAsDisplay ? c.display : c.value).toLowerCase();
                    const isSelected = selected.includes(key);
                    return (
                        <ContactRow
                            key={c.value}
                            contact={c}
                            selected={isSelected}
                            onToggle={() => onToggle(compareAsDisplay ? c.display : c.value)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function confidenceMeta(score: number): { label: string; cls: string } {
    if (score >= 60) return { label: "Haute", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    if (score >= 30) return { label: "Moyenne", cls: "bg-amber-100 text-amber-700 ring-amber-200" };
    return { label: "Faible", cls: "bg-zinc-100 text-zinc-600 ring-zinc-200" };
}

function shortenUrl(u: string): string {
    try {
        const url = new URL(u);
        const path = url.pathname === "/" ? "" : url.pathname;
        return `${url.hostname}${path}`.replace(/\/$/, "");
    } catch {
        return u;
    }
}

function ContactRow({
    contact,
    selected,
    onToggle,
}: {
    contact: IScanContact;
    selected: boolean;
    onToggle: () => void;
}) {
    const [open, setOpen] = useState(false);
    const conf = confidenceMeta(contact.confidence);
    const occCount = contact.occurrences.length;

    return (
        <div
            className={`rounded-lg border transition ${
                selected
                    ? "border-violet-500 bg-violet-50/80 ring-1 ring-violet-300"
                    : "border-violet-200/70 bg-white hover:border-violet-300"
            }`}
        >
            <div className="flex items-center gap-2 px-2.5 py-1.5">
                <button
                    type="button"
                    onClick={onToggle}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition ${
                        selected ? "bg-violet-600 text-white" : "text-violet-700 hover:bg-violet-100"
                    }`}
                    title={selected ? "Retirer de la liste" : "Ajouter à la liste"}
                >
                    {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    <span className="font-mono">{contact.display}</span>
                </button>

                <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${conf.cls}`}
                    title={`Score: ${contact.confidence}/100`}
                >
                    {conf.label}
                </span>

                {contact.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                        {t}
                    </span>
                ))}

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                    {occCount} source{occCount > 1 ? "s" : ""}
                    {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
            </div>

            {open && (
                <div className="border-t border-violet-100 bg-white/60 px-3 py-2 flex flex-col gap-2">
                    {contact.occurrences.map((o, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                            <a
                                href={o.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:underline"
                            >
                                <LinkIcon className="h-3 w-3" />
                                <span className="font-mono truncate max-w-[360px]">{shortenUrl(o.url)}</span>
                                <ExternalLink className="h-3 w-3 opacity-60" />
                                <span className="text-muted-foreground">· via {o.via}</span>
                            </a>
                            <p className="text-[11px] text-muted-foreground leading-relaxed pl-4 italic">
                                {highlightValue(o.context, contact.display)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function highlightValue(context: string, value: string) {
    if (!value) return context;
    const digitsOnly = value.replace(/\D/g, "");
    const re = new RegExp(
        digitsOnly && digitsOnly.length >= 8
            ? digitsOnly.split("").join("[\\s.\\-]?")
            : escapeRegex(value),
        "i"
    );
    const m = context.match(re);
    if (!m || m.index === undefined) return context;
    const before = context.slice(0, m.index);
    const match = context.slice(m.index, m.index + m[0].length);
    const after = context.slice(m.index + m[0].length);
    return (
        <>
            {before}
            <mark className="bg-violet-200 text-violet-900 rounded px-0.5 not-italic font-medium">{match}</mark>
            {after}
        </>
    );
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
