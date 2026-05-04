// Filtre Builder pour la page bulk : types + helpers (composition de la query
// Shopify, sérialisation URL). Aucune dépendance React — testable et réutilisable.
//
// La query Shopify est composée ici puis envoyée à
// /shopify/search-products-advanced. Les filtres "fins" (variante 0, missing
// channels) sont appliqués côté client après réception (page.tsx).

export type BulkSortKey = "TITLE" | "CREATED_AT" | "UPDATED_AT" | "VENDOR" | "PRODUCT_TYPE";
export type BulkStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface BulkFilters {
    text: string;
    tagsInclude: string[];
    tagsIncludeOp: "AND" | "OR";
    tagsExclude: string[];
    priceMin: number | null;
    priceMax: number | null;
    status: BulkStatus | null;
    vendor: string | null;
    productType: string | null;
    missingChannels: boolean;
}

export interface BulkSort {
    sortKey: BulkSortKey;
    reverse: boolean;
}

export const DEFAULT_FILTERS: BulkFilters = {
    text: "",
    tagsInclude: [],
    tagsIncludeOp: "AND",
    tagsExclude: [],
    priceMin: null,
    priceMax: null,
    status: null,
    vendor: null,
    productType: null,
    missingChannels: false,
};

export const DEFAULT_SORT: BulkSort = {
    sortKey: "CREATED_AT",
    reverse: true,
};

// True si au moins un filtre est actif. Sert pour l'UX (compteur, bouton "vider").
export function hasActiveFilters(f: BulkFilters): boolean {
    return (
        f.text.trim() !== "" ||
        f.tagsInclude.length > 0 ||
        f.tagsExclude.length > 0 ||
        f.priceMin !== null ||
        f.priceMax !== null ||
        f.status !== null ||
        f.vendor !== null ||
        f.productType !== null ||
        f.missingChannels
    );
}

// Échappe les apostrophes dans une valeur de tag/vendor pour la query Shopify.
function escapeQ(s: string): string {
    return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Construit la query Shopify Admin (ex: tag:'foo' AND tag:'bar' AND price:>=10).
// Note : Shopify ne distingue pas la "variante 0" — price:>=N matche si une
// variante au moins est dans le range. Le filtre fin "variante 0 uniquement"
// est appliqué côté client après réception.
export function buildShopifyQuery(filters: BulkFilters): string {
    const parts: string[] = [];

    if (filters.text.trim()) {
        const t = escapeQ(filters.text.trim().replace(/[*?"]/g, ""));
        parts.push(`(title:*${t}* OR sku:*${t}* OR vendor:*${t}*)`);
    }

    if (filters.tagsInclude.length > 0) {
        const op = filters.tagsIncludeOp === "AND" ? " AND " : " OR ";
        const tagsPart = filters.tagsInclude.map((t) => `tag:'${escapeQ(t)}'`).join(op);
        parts.push(filters.tagsInclude.length > 1 ? `(${tagsPart})` : tagsPart);
    }

    for (const t of filters.tagsExclude) {
        parts.push(`-tag:'${escapeQ(t)}'`);
    }

    if (filters.priceMin !== null && Number.isFinite(filters.priceMin)) parts.push(`price:>=${filters.priceMin}`);
    if (filters.priceMax !== null && Number.isFinite(filters.priceMax)) parts.push(`price:<=${filters.priceMax}`);

    if (filters.status) parts.push(`status:${filters.status}`);

    if (filters.vendor) parts.push(`vendor:'${escapeQ(filters.vendor)}'`);
    if (filters.productType) parts.push(`product_type:'${escapeQ(filters.productType)}'`);

    // missingChannels : Shopify n'expose pas de query — traité côté client / via
    // l'endpoint dédié productsMissingChannels (cf. page.tsx étape 4).

    return parts.join(" AND ");
}

// ─── Sérialisation URL ──────────────────────────────────────────────────────

const KEYS = {
    text: "q",
    tags: "tags",
    op: "op",
    notags: "notags",
    priceMin: "priceMin",
    priceMax: "priceMax",
    status: "status",
    vendor: "vendor",
    productType: "type",
    missingChannels: "missing",
    sortKey: "sort",
    reverse: "desc",
} as const;

function nonEmpty(v: string): string | null {
    return v.length > 0 ? v : null;
}

export function serializeFilters(filters: BulkFilters, sort: BulkSort): URLSearchParams {
    const sp = new URLSearchParams();
    if (filters.text.trim()) sp.set(KEYS.text, filters.text.trim());
    if (filters.tagsInclude.length > 0) sp.set(KEYS.tags, filters.tagsInclude.join(","));
    if (filters.tagsInclude.length > 1) sp.set(KEYS.op, filters.tagsIncludeOp);
    if (filters.tagsExclude.length > 0) sp.set(KEYS.notags, filters.tagsExclude.join(","));
    if (filters.priceMin !== null) sp.set(KEYS.priceMin, String(filters.priceMin));
    if (filters.priceMax !== null) sp.set(KEYS.priceMax, String(filters.priceMax));
    if (filters.status) sp.set(KEYS.status, filters.status);
    if (filters.vendor) sp.set(KEYS.vendor, filters.vendor);
    if (filters.productType) sp.set(KEYS.productType, filters.productType);
    if (filters.missingChannels) sp.set(KEYS.missingChannels, "1");
    if (sort.sortKey !== DEFAULT_SORT.sortKey) sp.set(KEYS.sortKey, sort.sortKey);
    if (sort.reverse !== DEFAULT_SORT.reverse) sp.set(KEYS.reverse, sort.reverse ? "1" : "0");
    return sp;
}

function parseTagList(raw: string | null): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

function parseNumberOrNull(raw: string | null): number | null {
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

function parseStatus(raw: string | null): BulkStatus | null {
    if (raw === "ACTIVE" || raw === "DRAFT" || raw === "ARCHIVED") return raw;
    return null;
}

function parseSortKey(raw: string | null): BulkSortKey {
    if (raw === "TITLE" || raw === "CREATED_AT" || raw === "UPDATED_AT" || raw === "VENDOR" || raw === "PRODUCT_TYPE") return raw;
    return DEFAULT_SORT.sortKey;
}

export function parseFilters(sp: URLSearchParams): { filters: BulkFilters; sort: BulkSort } {
    const filters: BulkFilters = {
        text: sp.get(KEYS.text) ?? "",
        tagsInclude: parseTagList(sp.get(KEYS.tags)),
        tagsIncludeOp: sp.get(KEYS.op) === "OR" ? "OR" : "AND",
        tagsExclude: parseTagList(sp.get(KEYS.notags)),
        priceMin: parseNumberOrNull(sp.get(KEYS.priceMin)),
        priceMax: parseNumberOrNull(sp.get(KEYS.priceMax)),
        status: parseStatus(sp.get(KEYS.status)),
        vendor: nonEmpty(sp.get(KEYS.vendor) ?? ""),
        productType: nonEmpty(sp.get(KEYS.productType) ?? ""),
        missingChannels: sp.get(KEYS.missingChannels) === "1",
    };
    const sort: BulkSort = {
        sortKey: parseSortKey(sp.get(KEYS.sortKey)),
        reverse: sp.get(KEYS.reverse) === null ? DEFAULT_SORT.reverse : sp.get(KEYS.reverse) === "1",
    };
    return { filters, sort };
}
