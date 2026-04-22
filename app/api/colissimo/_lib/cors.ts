import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/library/auth/auth";

// Liste blanche des origines chrome-extension:// autorisées.
// En dev on laisse passer toutes les chrome-extension://, en prod uniquement l'ID publié.
const ALLOWED_EXT_IDS = (process.env.COLISSIMO_EXT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return false;
    if (!origin.startsWith("chrome-extension://")) return false;
    if (process.env.NODE_ENV !== "production") return true;
    const id = origin.replace("chrome-extension://", "");
    return ALLOWED_EXT_IDS.includes(id);
}

export function corsHeaders(origin: string | null): HeadersInit {
    if (!isAllowedOrigin(origin)) return {};
    return {
        "Access-Control-Allow-Origin": origin!,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
    };
}

export function corsOptionsResponse(req: NextRequest): NextResponse {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export function corsJson<T>(req: NextRequest, body: T, init?: ResponseInit): NextResponse {
    return NextResponse.json(body, {
        ...init,
        headers: { ...corsHeaders(req.headers.get("origin")), ...(init?.headers ?? {}) },
    });
}

export async function requireAuth(req: NextRequest): Promise<{ ok: true } | NextResponse> {
    const session = await auth();
    if (!session?.user) {
        return corsJson(req, { error: "unauthenticated" }, { status: 401 });
    }
    return { ok: true };
}
