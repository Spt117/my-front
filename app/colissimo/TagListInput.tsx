"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface Props {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    type?: "email" | "text";
    validate?: (value: string) => string | null; // retourne un msg d'erreur ou null
    icon?: React.ElementType;
}

export default function TagListInput({
    values,
    onChange,
    placeholder,
    type = "text",
    validate,
    icon: Icon,
}: Props) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        const err = validate?.(t) ?? null;
        if (err) {
            setError(err);
            return;
        }
        if (values.some((v) => v.toLowerCase() === t.toLowerCase())) {
            setError("Déjà dans la liste");
            return;
        }
        onChange([...values, t]);
        setDraft("");
        setError(null);
    };

    const remove = (i: number) => {
        const next = values.slice();
        next.splice(i, 1);
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-2">
            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {values.map((v, i) => (
                        <span
                            key={`${v}-${i}`}
                            className="inline-flex items-center gap-1 rounded-full bg-muted pl-2.5 pr-1 py-0.5 text-xs font-mono"
                        >
                            {v}
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-red-100 hover:text-red-700"
                                title="Retirer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="relative flex gap-2">
                <div className="relative flex-1">
                    {Icon && (
                        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                        type={type}
                        placeholder={placeholder}
                        value={draft}
                        onChange={(e) => {
                            setDraft(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                add();
                            }
                        }}
                        className={`w-full ${Icon ? "pl-9" : ""}`}
                    />
                </div>
                <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function validateEmail(v: string): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return "Email invalide";
    return null;
}
