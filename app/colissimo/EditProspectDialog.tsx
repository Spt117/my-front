"use client";

import Selecteur from "@/components/selecteur";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    IProspectColissimo,
    PROSPECT_STATUS_LABEL,
    PROSPECT_STATUSES,
    TProspectStatus,
} from "@/library/types/prospectColissimo";
import { ExternalLink, Globe, Loader2, Mail, Phone, StickyNote } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProspect } from "./actions";
import ContactScanner from "./ContactScanner";

const STATUS_OPTIONS = PROSPECT_STATUSES.map((s) => ({ value: s, label: PROSPECT_STATUS_LABEL[s] }));

interface Props {
    prospect: IProspectColissimo | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: (prospect: IProspectColissimo) => void;
}

function Field({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
            </label>
            {children}
        </div>
    );
}

export default function EditProspectDialog({ prospect, open, onOpenChange, onSaved }: Props) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<TProspectStatus>("a_prospecter");
    const [notes, setNotes] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (prospect) {
            setEmail(prospect.email ?? "");
            setPhone(prospect.phone ?? "");
            setStatus(prospect.status);
            setNotes(prospect.notes ?? "");
        }
    }, [prospect]);

    const handleSave = () => {
        if (!prospect) return;
        startTransition(async () => {
            const res = await updateProspect(prospect.id, {
                email: email.trim(),
                phone: phone.trim(),
                status,
                notes: notes.trim(),
            });
            if (res.success && res.prospect) {
                toast.success("Prospect mis à jour");
                onSaved(res.prospect);
                onOpenChange(false);
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                            <Globe className="h-4 w-4" />
                        </div>
                        {prospect && (
                            <a
                                href={`https://${prospect.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-base hover:text-sky-700 hover:underline"
                                title="Ouvrir le site"
                            >
                                {prospect.domain}
                                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                            </a>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                    {prospect && (
                        <ContactScanner
                            domain={prospect.domain}
                            currentEmail={email}
                            currentPhone={phone}
                            onPickEmail={setEmail}
                            onPickPhone={setPhone}
                        />
                    )}
                    <Field label="Email" icon={Mail}>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            placeholder="contact@exemple.fr"
                        />
                    </Field>
                    <Field label="Téléphone" icon={Phone}>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full"
                            placeholder="+33 6 00 00 00 00"
                        />
                    </Field>
                    <Field label="Statut" icon={Globe}>
                        <Selecteur
                            value={status}
                            onChange={(v) => setStatus(v as TProspectStatus)}
                            array={STATUS_OPTIONS}
                            placeholder="Statut"
                            className="w-full"
                        />
                    </Field>
                    <Field label="Notes" icon={StickyNote}>
                        <Textarea
                            rows={5}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contexte, contact, historique…"
                        />
                    </Field>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
