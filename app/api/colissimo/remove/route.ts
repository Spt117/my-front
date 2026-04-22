import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function POST(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const { id } = (await req.json()) as { id: string };
    if (!id) return corsJson(req, { error: "id manquant" }, { status: 400 });

    try {
        await prospectColissimoService.remove(id);
        return corsJson(req, { success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur interne";
        return corsJson(req, { error: message }, { status: 500 });
    }
}
