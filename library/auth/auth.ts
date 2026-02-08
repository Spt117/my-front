import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { authSecret, email, googleId, googleSecret } from "../utils/uri";
import { getMongoClientForAuth } from "./connectorAuth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: googleId as string,
            clientSecret: googleSecret as string,
        }),
        Nodemailer({
            server: {
                host: email.host,
                port: Number(email.port),
                auth: {
                    user: email.server,
                    pass: email.password,
                },
            },
            from: email.server,
        }),
    ],
    adapter: MongoDBAdapter(getMongoClientForAuth(), {
        databaseName: "NextAuth-my-front",
    }),
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token.my-front`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        csrfToken: {
            name: `next-auth.csrf-token.my-front`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url.my-front`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
        state: {
            name: `next-auth.state.my-front`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 900,
            },
        },
        pkceCodeVerifier: {
            name: `next-auth.pkce.code_verifier.my-front`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 900,
            },
        },
    },
    secret: authSecret,
    trustHost: true,
});
