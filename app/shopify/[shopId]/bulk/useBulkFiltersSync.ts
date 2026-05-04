"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { parseFilters, serializeFilters } from "./bulkQuery";
import useBulkStore from "./storeBulk";

// Synchronise filtres + tri ↔ URL, pour la route /bulk uniquement.
//
// - Au mount : hydrate le store depuis l'URL (si présent).
// - Aux changements ultérieurs du store : remplace les query params (history.replaceState
//   pour ne pas polluer l'historique ni déclencher un re-render Next).
//
// Strict scope : ne touche QUE aux clés gérées par bulkQuery.ts. Les autres clés
// éventuelles dans l'URL sont préservées.
export default function useBulkFiltersSync() {
    const searchParams = useSearchParams();
    const filters = useBulkStore((s) => s.filters);
    const sort = useBulkStore((s) => s.sort);
    const setFilters = useBulkStore((s) => s.setFilters);
    const setSort = useBulkStore((s) => s.setSort);
    const hydratedRef = useRef(false);

    // Hydratation initiale depuis l'URL.
    useEffect(() => {
        if (hydratedRef.current) return;
        const sp = new URLSearchParams(searchParams?.toString() ?? "");
        const { filters: f, sort: s } = parseFilters(sp);
        setFilters(f);
        setSort(s);
        hydratedRef.current = true;
    }, [searchParams, setFilters, setSort]);

    // Push vers l'URL à chaque changement (debounced via microtask, pas besoin de plus
    // car serializeFilters est cheap).
    useEffect(() => {
        if (!hydratedRef.current) return;
        if (typeof window === "undefined") return;

        const next = serializeFilters(filters, sort);
        // Préserver les clés non gérées (théoriquement aucune sur /bulk, mais safe).
        const current = new URLSearchParams(window.location.search);
        const handled = new Set(["q", "tags", "op", "notags", "priceMin", "priceMax", "status", "vendor", "type", "missing", "sort", "desc"]);
        for (const [k, v] of current) {
            if (!handled.has(k) && !next.has(k)) next.set(k, v);
        }

        const qs = next.toString();
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        if (url !== window.location.pathname + window.location.search) {
            window.history.replaceState(null, "", url);
        }
    }, [filters, sort]);
}
