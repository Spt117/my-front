import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { PROSPECT_STATUSES, TProspectStatus } from "@/library/types/prospectColissimo";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function POST(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const { id, status } = (await req.json()) as { id: string; status: TProspectStatus };
    if (!id || !PROSPECT_STATUSES.includes(status)) {
        return corsJson(req, { error: "paramètres invalides" }, { status: 400 });
    }

    try {
        await prospectColissimoService.update(id, { status });
        return corsJson(req, { success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur interne";
        return corsJson(req, { error: message }, { status: 500 });
    }
}
