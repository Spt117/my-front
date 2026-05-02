"use client";
import { Input } from "@/components/ui/input";
import { XCircle } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface Props {
    value: string;
    onChange: (v: string) => void;
    onSelect?: (v: string) => void;
    suggestions: string[];
    placeholder?: string;
    leftIcon?: ReactNode;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
}

export default function TagAutocomplete({ value, onChange, onSelect, suggestions, placeholder = "Filtrer par tag...", leftIcon, disabled, className, inputClassName }: Props) {
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [suggestions]);

    const select = (tag: string) => {
        onChange(tag);
        onSelect?.(tag);
        setOpen(false);
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setOpen(false);
            return;
        }
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            select(suggestions[highlightedIndex]);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className || ""}`}>
            {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{leftIcon}</span>}
            <Input
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                disabled={disabled}
                className={`${leftIcon ? "pl-10" : ""} pr-9 ${inputClassName || ""}`}
            />
            {value && !disabled && (
                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onChange("");
                        setOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    aria-label="Effacer"
                >
                    <XCircle size={16} />
                </button>
            )}
            {open && suggestions.length > 0 && (
                <ul className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((tag, idx) => (
                        <li
                            key={tag}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                select(tag);
                            }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`px-3 py-2 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-b-0 ${
                                idx === highlightedIndex ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
