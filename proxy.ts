import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/boarding", "/api/auth"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);

    // Routes publiques
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return response;
    }

    // Vérification du JWT (fonctionne en edge, pas besoin de MongoDB)
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        cookieName: "next-auth.session-token.my-front",
    });

    // Pas de session -> boarding
    if (!token) {
        return NextResponse.redirect(new URL("/boarding", req.url));
    }

    // Email non autorisé -> boarding
    if (token.email !== process.env.USER_EMAIL) {
        return NextResponse.redirect(new URL("/boarding", req.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
};
