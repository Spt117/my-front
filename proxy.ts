// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", req.nextUrl.pathname); // Injecte le pathname dans les headers
    return response;
}

export const config = {
    matcher: ["/:path*"], // Applique le middleware à toutes les routes
};
