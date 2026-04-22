"use server";

export type TScanVia = "tel" | "mailto" | "text" | "json-ld";

export interface IScanOccurrence {
    url: string;
    context: string; // extrait de texte nettoyé autour du match
    via: TScanVia;
}

export interface IScanContact {
    value: string; // valeur normalisée (canonique)
    display: string; // affichage lisible
    occurrences: IScanOccurrence[];
    confidence: number; // 0..100
    tags: string[]; // ex. ["tel:", "page contact", "mentions légales", "× 3 pages"]
}

export interface IScanResult {
    domain: string;
    emails: IScanContact[];
    phones: IScanContact[];
    pagesScanned: string[];
    errors: string[];
}

const USER_AGENT =
    "Mozilla/5.0 (compatible; DigiblockProspector/1.0; +https://digiblock.fr)";
const FETCH_TIMEOUT_MS = 6000;
const MAX_PAGES = 28;
const CONTEXT_RADIUS = 60;

// Optimisé pour boutiques Shopify
// ORDRE IMPORTANT : les pages à plus fort signal sont en premier.
// finalUrls est tronqué à MAX_PAGES — les dernières entrées peuvent être coupées.
const CANDIDATE_PATHS = [
    "/",
    // Policies Shopify (les plus fiables pour les infos légales)
    "/policies/legal-notice",
    "/policies/contact-information",
    "/policies/terms-of-sale",
    "/policies/terms-of-service",
    "/policies/privacy-policy",
    "/policies/shipping-policy",
    "/policies/refund-policy",
    // Pages Shopify classiques
    "/pages/contact",
    "/pages/contact-us",
    "/pages/nous-contacter",
    "/pages/contactez-nous",
    "/pages/service-client",
    "/pages/mentions-legales",
    "/pages/cgv",
    "/pages/cgu",
    "/pages/a-propos",
    "/pages/about-us",
    "/pages/qui-sommes-nous",
    "/pages/boutiques",
    "/pages/nos-boutiques",
    "/pages/stores",
    // Variantes non-Shopify mais utiles (fallback)
    "/contact",
    "/mentions-legales",
    "/cgv",
];

const EXCLUDED_PATH_PATTERNS = [
    /\/products?\//i,
    /\/product-category\//i,
    /\/collections?\//i,
    /\/categorie\//i,
    /\/category\//i,
    /\/shop\//i,
    /\/boutique\//i,
    /\/panier/i,
    /\/cart/i,
    /\/checkout/i,
    /\/account/i,
    /\/compte/i,
    /\/login/i,
    /\/register/i,
    /\/search/i,
    /\/recherche/i,
    /\/blog\//i,
    /\/article\//i,
];

const EMAIL_BLOCKLIST = [
    /^(test|noreply|no-reply|donotreply|do-not-reply|postmaster|mailer-daemon)@/i,
    /@(example|test|domain|yourdomain|mail)\.(com|fr|test|local)$/i,
    /@sentry\./i,
    /@wixpress\./i,
    /\.(png|jpg|jpeg|gif|webp|svg|pdf|js|css|woff2?|ttf)$/i,
];

function isExcluded(pathname: string): boolean {
    return EXCLUDED_PATH_PATTERNS.some((re) => re.test(pathname));
}

function pageKind(url: string): { label: string | null; weight: number } {
    const p = new URL(url).pathname.toLowerCase();
    if (/\/policies\/contact-information/.test(p))
        return { label: "Shopify contact", weight: 40 };
    if (/\/policies\/legal-notice|mentions[-_]?legales/.test(p))
        return { label: "mentions légales", weight: 35 };
    if (/\/policies\/terms-of-sale/.test(p)) return { label: "CGV Shopify", weight: 30 };
    if (/\/policies\//.test(p)) return { label: "policy Shopify", weight: 25 };
    if (/\/contact|nous[-_]?contacter|contactez/.test(p)) return { label: "page contact", weight: 25 };
    if (/about|qui[-_]?sommes|a[-_]?propos|apropos/.test(p)) return { label: "à propos", weight: 10 };
    if (/boutiques|stores/.test(p)) return { label: "boutiques", weight: 15 };
    if (/cgv|cgu|support|sav|service[-_]?client/.test(p)) return { label: "CGV/SAV", weight: 10 };
    if (p === "/" || p === "") return { label: "accueil", weight: 5 };
    return { label: null, weight: 0 };
}

function normalizeEmail(raw: string): string {
    return raw.trim().toLowerCase();
}

// Normalise un téléphone en forme canonique pour déduplication.
// +33X → 0X (FR), sinon +<digits> si préfixé, sinon <digits>.
function normalizePhone(raw: string): string | null {
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;

    if (hasPlus) {
        // +33<9 chiffres> → 0<9 chiffres> (forme FR canonique)
        if (/^33\d{9}$/.test(digits)) return "0" + digits.slice(2);
        // +1<10 chiffres> (US/CA), garde tel quel
        return `+${digits}`;
    }
    // Numéro FR 10 chiffres commençant par 0
    if (/^0\d{9}$/.test(digits)) return digits;
    // 33<9 chiffres> sans + → normalise en 0<9 chiffres>
    if (/^33\d{9}$/.test(digits) && digits.length === 11) return "0" + digits.slice(2);
    return digits;
}

function formatPhoneFR(normalized: string): string {
    if (/^0\d{9}$/.test(normalized)) {
        return normalized.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
    }
    if (/^\+33\d{9}$/.test(normalized)) {
        const rest = normalized.slice(3);
        return `+33 ${rest.slice(0, 1)} ${rest.slice(1).replace(/(\d{2})(?=\d)/g, "$1 ").trim()}`;
    }
    return normalized;
}

function isValidEmail(email: string): boolean {
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return false;
    if (EMAIL_BLOCKLIST.some((re) => re.test(email))) return false;
    return true;
}

async function fetchWithTimeout(url: string): Promise<string | null> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": USER_AGENT, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
            redirect: "follow",
            signal: ctrl.signal,
        });
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("html") && !ct.includes("text")) return null;
        return await res.text();
    } catch {
        return null;
    } finally {
        clearTimeout(to);
    }
}

// Extrait les blocs JSON-LD (<script type="application/ld+json">...</script>)
// et collecte les infos de contact (telephone, email, address, name)
interface IJsonLdFindings {
    phones: string[];
    emails: string[];
}
function extractJsonLdContacts(html: string): IJsonLdFindings {
    const phones = new Set<string>();
    const emails = new Set<string>();

    const blockRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    for (const m of html.matchAll(blockRe)) {
        const raw = m[1].trim();
        if (!raw) continue;
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            continue;
        }
        walkJsonLd(parsed, phones, emails);
    }
    return { phones: [...phones], emails: [...emails] };
}

function walkJsonLd(node: unknown, phones: Set<string>, emails: Set<string>): void {
    if (!node) return;
    if (Array.isArray(node)) {
        for (const n of node) walkJsonLd(n, phones, emails);
        return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
        const key = k.toLowerCase();
        if (typeof v === "string") {
            if (key === "telephone" || key === "phone" || key === "faxnumber") {
                phones.add(v);
            } else if (key === "email") {
                emails.add(v);
            }
        } else if (Array.isArray(v) || (typeof v === "object" && v !== null)) {
            walkJsonLd(v, phones, emails);
        }
    }
}

// Extrait le texte visible (supprime <script>, <style>, tags, entities)
function stripHtmlToText(html: string): string {
    let s = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
    s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
    s = s.replace(/<!--[\s\S]*?-->/g, " ");
    s = s.replace(/<[^>]+>/g, " ");
    s = s
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
    return s.replace(/\s+/g, " ").trim();
}

function makeContext(text: string, start: number, end: number): string {
    const s = Math.max(0, start - CONTEXT_RADIUS);
    const e = Math.min(text.length, end + CONTEXT_RADIUS);
    const prefix = s > 0 ? "…" : "";
    const suffix = e < text.length ? "…" : "";
    return (prefix + text.slice(s, e) + suffix).replace(/\s+/g, " ").trim();
}

interface IRawHit {
    value: string; // normalisé
    display: string;
    occurrence: IScanOccurrence;
}

function extractEmails(html: string, text: string, url: string, jsonLd: IJsonLdFindings): IRawHit[] {
    const hits: IRawHit[] = [];

    // 0) JSON-LD (Organization.email, etc.) → très haute confiance
    for (const raw of jsonLd.emails) {
        const email = normalizeEmail(raw);
        if (!isValidEmail(email)) continue;
        hits.push({
            value: email,
            display: email,
            occurrence: { url, context: `schema.org (JSON-LD) : ${email}`, via: "json-ld" },
        });
    }

    // 1) mailto: dans le HTML (contexte = texte du lien approximatif via text)
    for (const m of html.matchAll(/mailto:([^"'?\s>]+)/gi)) {
        const email = normalizeEmail(decodeURIComponent(m[1]));
        if (!isValidEmail(email)) continue;
        const idx = text.toLowerCase().indexOf(email);
        const ctx = idx >= 0 ? makeContext(text, idx, idx + email.length) : `mailto: ${email}`;
        hits.push({
            value: email,
            display: email,
            occurrence: { url, context: ctx, via: "mailto" },
        });
    }

    // 2) Texte brut
    for (const m of text.matchAll(/[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi)) {
        const email = normalizeEmail(m[0]);
        if (!isValidEmail(email)) continue;
        const start = m.index ?? 0;
        hits.push({
            value: email,
            display: email,
            occurrence: { url, context: makeContext(text, start, start + m[0].length), via: "text" },
        });
    }

    return hits;
}

function extractPhones(html: string, text: string, url: string, jsonLd: IJsonLdFindings): IRawHit[] {
    const hits: IRawHit[] = [];

    // 0) JSON-LD → très haute confiance
    for (const raw of jsonLd.phones) {
        const n = normalizePhone(raw);
        if (!n) continue;
        hits.push({
            value: n,
            display: formatPhoneFR(n),
            occurrence: { url, context: `schema.org (JSON-LD) : ${raw}`, via: "json-ld" },
        });
    }

    // 1) tel: links — contexte : chercher la position dans le texte
    for (const m of html.matchAll(/tel:([^"'?\s>]+)/gi)) {
        const n = normalizePhone(decodeURIComponent(m[1]));
        if (!n) continue;
        const display = formatPhoneFR(n);
        // Cherche dans le texte la forme la plus proche (sans reformater)
        const digits = n.replace(/\D/g, "");
        const idx = findPhoneInText(text, digits);
        const ctx =
            idx >= 0
                ? makeContext(text, idx, idx + digits.length)
                : `tel: ${display}`;
        hits.push({
            value: n,
            display,
            occurrence: { url, context: ctx, via: "tel" },
        });
    }

    // 2) FR 0X XX XX XX XX
    for (const m of text.matchAll(/(?<![\d-])0\s?[1-9](?:[\s.\-]?\d{2}){4}(?![\d-])/g)) {
        const n = normalizePhone(m[0]);
        if (!n) continue;
        const start = m.index ?? 0;
        hits.push({
            value: n,
            display: formatPhoneFR(n),
            occurrence: { url, context: makeContext(text, start, start + m[0].length), via: "text" },
        });
    }

    // 3) International +XX …
    for (const m of text.matchAll(/\+\d{1,3}[\s.\-]?\d(?:[\s.\-]?\d{1,4}){2,6}/g)) {
        const n = normalizePhone(m[0]);
        if (!n) continue;
        const start = m.index ?? 0;
        hits.push({
            value: n,
            display: formatPhoneFR(n),
            occurrence: { url, context: makeContext(text, start, start + m[0].length), via: "text" },
        });
    }

    return hits;
}

// Cherche une séquence de chiffres dans le texte, en ignorant espaces/ponctuation entre les chiffres
function findPhoneInText(text: string, digits: string): number {
    const lower = text.toLowerCase();
    let i = 0;
    while (i < lower.length) {
        // Cherche le premier chiffre
        const firstIdx = lower.indexOf(digits[0], i);
        if (firstIdx < 0) return -1;
        let t = firstIdx;
        let d = 0;
        while (t < lower.length && d < digits.length) {
            const c = lower[t];
            if (/\d/.test(c)) {
                if (c !== digits[d]) break;
                d++;
                t++;
            } else if (/[\s.\-]/.test(c)) {
                t++;
            } else break;
        }
        if (d === digits.length) return firstIdx;
        i = firstIdx + 1;
    }
    return -1;
}

function extractInternalContactLinks(html: string, origin: string): string[] {
    const out = new Set<string>();
    for (const m of html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
        const href = m[1].trim();
        let url: URL;
        try {
            url = new URL(href, origin);
        } catch {
            continue;
        }
        if (url.origin !== origin) continue;
        const path = url.pathname.toLowerCase();
        if (isExcluded(path)) continue;
        if (!/contact|mention|legal|about|a-propos|apropos|qui-sommes|cgv|sav|support/i.test(path)) continue;
        out.add(url.origin + url.pathname);
    }
    return [...out];
}

function scoreContact(value: string, occurrences: IScanOccurrence[]): { score: number; tags: string[] } {
    let score = 0;
    const tags: string[] = [];
    const urls = new Set<string>();

    const hasJsonLd = occurrences.some((o) => o.via === "json-ld");
    const hasTelLink = occurrences.some((o) => o.via === "tel");
    const hasMailto = occurrences.some((o) => o.via === "mailto");
    if (hasJsonLd) {
        score += 60;
        tags.push("schema.org");
    }
    if (hasTelLink) {
        score += 50;
        tags.push("lien tel:");
    }
    if (hasMailto) {
        score += 50;
        tags.push("lien mailto:");
    }

    for (const o of occurrences) {
        urls.add(o.url);
        const k = pageKind(o.url);
        score += k.weight;
    }

    // Présence de mots-clés dans le contexte = +15
    const kw = /(t[ée]l|phone|contact|appel|appeler|joindre|r[ée]servation|e-?mail|courriel)/i;
    if (occurrences.some((o) => kw.test(o.context))) {
        score += 15;
        tags.push("contexte contact");
    }

    // Multi-pages : +5 par page supplémentaire
    if (urls.size > 1) {
        score += 5 * (urls.size - 1);
        tags.push(`× ${urls.size} pages`);
    }

    // Labels pages clés (uniques)
    const pageLabels = new Set<string>();
    for (const o of occurrences) {
        const lab = pageKind(o.url).label;
        if (lab && lab !== "accueil") pageLabels.add(lab);
    }
    for (const lab of pageLabels) tags.push(lab);

    // Plafonne à 100
    const normalized = Math.max(0, Math.min(100, score));
    return { score: normalized, tags: [...new Set(tags)] };
}

function aggregate(hits: IRawHit[]): IScanContact[] {
    const map = new Map<string, { display: string; occurrences: IScanOccurrence[] }>();
    for (const h of hits) {
        if (!map.has(h.value)) map.set(h.value, { display: h.display, occurrences: [] });
        map.get(h.value)!.occurrences.push(h.occurrence);
    }

    const out: IScanContact[] = [];
    for (const [value, { display, occurrences }] of map) {
        // Dedupe occurrences (par url+via) pour éviter les doublons dans la même page
        const seen = new Set<string>();
        const deduped: IScanOccurrence[] = [];
        for (const o of occurrences) {
            const key = `${o.url}|${o.via}`;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(o);
        }
        const { score, tags } = scoreContact(value, deduped);
        out.push({ value, display, occurrences: deduped, confidence: score, tags });
    }

    out.sort((a, b) => b.confidence - a.confidence);
    return out;
}

export async function scanDomainContacts(domain: string): Promise<IScanResult> {
    const cleaned = domain.trim().toLowerCase();
    const result: IScanResult = {
        domain: cleaned,
        emails: [],
        phones: [],
        pagesScanned: [],
        errors: [],
    };

    if (!cleaned) return result;

    const baseUrls = [`https://${cleaned}`, `https://www.${cleaned}`];
    let origin: string | null = null;
    let homeHtml: string | null = null;

    for (const base of baseUrls) {
        const html = await fetchWithTimeout(base + "/");
        if (html) {
            origin = new URL(base).origin;
            homeHtml = html;
            break;
        }
    }

    if (!origin) {
        result.errors.push("Impossible de joindre le site");
        return result;
    }

    const urls = new Set<string>();
    for (const p of CANDIDATE_PATHS) urls.add(origin + p);
    if (homeHtml) for (const link of extractInternalContactLinks(homeHtml, origin)) urls.add(link);

    const finalUrls = [...urls].filter((u) => !isExcluded(new URL(u).pathname)).slice(0, MAX_PAGES);

    const htmlByUrl = new Map<string, string>();
    if (homeHtml) htmlByUrl.set(origin + "/", homeHtml);
    const toFetch = finalUrls.filter((u) => !htmlByUrl.has(u));
    const fetched = await Promise.all(toFetch.map((u) => fetchWithTimeout(u).then((h) => ({ u, h }))));
    for (const { u, h } of fetched) if (h) htmlByUrl.set(u, h);

    const emailHits: IRawHit[] = [];
    const phoneHits: IRawHit[] = [];

    for (const [url, html] of htmlByUrl) {
        result.pagesScanned.push(url);
        const text = stripHtmlToText(html);
        const jsonLd = extractJsonLdContacts(html);
        emailHits.push(...extractEmails(html, text, url, jsonLd));
        phoneHits.push(...extractPhones(html, text, url, jsonLd));
    }

    result.emails = aggregate(emailHits);
    result.phones = aggregate(phoneHits);

    return result;
}
