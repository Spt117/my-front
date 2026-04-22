import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { cleanDomainFromInput } from "@/app/colissimo/domain";
import { IProspectColissimoInput } from "@/library/types/prospectColissimo";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function POST(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const body = (await req.json()) as IProspectColissimoInput;
    const domain = cleanDomainFromInput(body.domain);
    if (!domain) return corsJson(req, { error: "Nom de domaine invalide" }, { status: 400 });

    const existing = await prospectColissimoService.getByDomain(domain);
    if (existing) return corsJson(req, { error: "Ce domaine existe déjà" }, { status: 409 });

    try {
        const prospect = await prospectColissimoService.create({ ...body, domain });
        return corsJson(req, { prospect });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur interne";
        return corsJson(req, { error: message }, { status: 500 });
    }
}
