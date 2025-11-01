import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/nodemailer";
import GoogleProvider from "next-auth/providers/google";
import { authSecret, email, googleId, googleSecret } from "../utils/uri";
import { getMongoClientForAuth } from "./connectorAuth";

// export const authOptions = {
//     providers: [
//         GoogleProvider({
//             clientId: googleId as string,
//             clientSecret: googleSecret as string,
//         }),
//         EmailProvider({
//             server: {
//                 host: email.host,
//                 port: Number(email.port),
//                 auth: {
//                     user: email.server,
//                     pass: email.password,
//                 },
//             },
//             from: email.server,
//         }),
//     ],
//     adapter: MongoDBAdapter(getMongoClientForAuth(), {
//         databaseName: "NextAuth-my-front",
//     }),
//     secret: authSecret,
// };
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: googleId as string,
            clientSecret: googleSecret as string,
        }),
        EmailProvider({
            server: {
                host: email.host,
                port: Number(email.port),
                auth: {
                    user: email.server,
                    pass: email.password,
                },
                secure: email.port === "465", // true pour port 465, false pour autres ports
            },
            from: email.server,
        }),
    ],
    adapter: MongoDBAdapter(getMongoClientForAuth(), {
        databaseName: "NextAuth-my-front",
    }),
    secret: authSecret,
});
