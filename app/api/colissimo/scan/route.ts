import { NextRequest } from "next/server";
import { scanDomainContacts } from "@/app/colissimo/scan";
import { cleanDomainFromInput } from "@/app/colissimo/domain";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

// Le scan fait jusqu'à 28 fetches → augmente le budget de temps par défaut.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const raw = req.nextUrl.searchParams.get("domain") ?? "";
    const domain = cleanDomainFromInput(raw);
    if (!domain) return corsJson(req, { error: "domaine invalide" }, { status: 400 });

    const result = await scanDomainContacts(domain);
    return corsJson(req, result);
}
