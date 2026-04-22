import { getDomain, parse } from "tldts";

// Extrait et normalise un domaine à partir d'un texte arbitraire.
// Valide strictement le TLD via la Public Suffix List (tldts).
// Retourne le domaine apex en minuscules (ex: "exemple.fr") ou null.
export function cleanDomainFromInput(input: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // 1) Essai direct sur l'entrée complète (cas : URL ou domaine brut)
    const direct = getDomain(trimmed, { validHosts: [] });
    if (direct) return direct.toLowerCase();

    // 2) Scan token par token pour trouver un domaine valide dans un texte libre
    const tokens = trimmed
        .toLowerCase()
        .split(/[\s<>(){}\[\]"',;]+/)
        .filter(Boolean);

    for (const raw of tokens) {
        const cleaned = raw.replace(/^[.\-]+|[.\-:]+$/g, "");
        if (!cleaned.includes(".")) continue;
        const parsed = parse(cleaned, { validHosts: [] });
        if (parsed.domain && parsed.isIcann) {
            return parsed.domain;
        }
    }

    return null;
}
