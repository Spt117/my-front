import { NextRequest } from "next/server";
import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { corsJson, corsOptionsResponse, requireAuth } from "../_lib/cors";

export const OPTIONS = (req: NextRequest) => corsOptionsResponse(req);

export async function GET(req: NextRequest) {
    const guard = await requireAuth(req);
    if ("ok" in guard === false) return guard as Response;

    const prospects = await prospectColissimoService.getAll();
    return corsJson(req, { prospects });
}
