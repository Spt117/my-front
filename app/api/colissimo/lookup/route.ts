import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { cleanDomainFromInput } from "@/app/colissimo/domain";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function GET(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const raw = req.nextUrl.searchParams.get("domain") ?? "";
    // Ping auth utilisé par l'extension : on répond OK sans lookup.
    if (raw === "__ping__") return corsJson(req, { prospect: null });

    const domain = cleanDomainFromInput(raw);
    if (!domain) return corsJson(req, { prospect: null });

    const prospect = await prospectColissimoService.getByDomain(domain);
    return corsJson(req, { prospect });
}
