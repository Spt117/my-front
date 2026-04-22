import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { IProspectColissimoInput } from "@/library/types/prospectColissimo";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function POST(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const body = (await req.json()) as { id: string } & Partial<IProspectColissimoInput>;
    if (!body.id) return corsJson(req, { error: "id manquant" }, { status: 400 });

    try {
        const { id, ...rest } = body;
        const prospect = await prospectColissimoService.update(id, rest);
        return corsJson(req, { prospect });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur interne";
        return corsJson(req, { error: message }, { status: 500 });
    }
}
