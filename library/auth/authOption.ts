import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { authSecret, email, googleId, googleSecret } from "../utils/uri";
import { getClientNextAuth } from "./authUser";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: googleId as string,
            clientSecret: googleSecret as string,
        }),
        EmailProvider({
            server: {
                host: email.host,
                port: email.port,
                auth: {
                    user: email.server,
                    pass: email.password,
                },
            },
            from: email.server,
        }),
    ],
    adapter: MongoDBAdapter(getClientNextAuth(), {
        databaseName: "NextAuth-my-front",
    }),
    secret: authSecret,
    // 🔎 Ici : log de l'URL de callback que Google doit accepter
    callbacks: {
        async redirect({ url, baseUrl }) {
            const expectedGoogleCallback = new URL("/api/auth/callback/google", process.env.NEXTAUTH_URL ?? baseUrl).toString();

            console.log("[NextAuth] baseUrl=", baseUrl);
            console.log("[NextAuth] NEXTAUTH_URL=", process.env.NEXTAUTH_URL);
            console.log("[NextAuth] redirect_uri attendu (Google) =", expectedGoogleCallback);

            // garde le comportement par défaut
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith("http")) return baseUrl;
            return new URL(url, baseUrl).toString();
        },
    },
};
