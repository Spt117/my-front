// ./auth.ts (ou authOption.ts)
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { authSecret, email, googleId, googleSecret } from '../utils/uri';
import { getMongoClientForAuth } from './connectorAuth';

export const authOptions: NextAuthOptions = {
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
            },
            from: email.server,
        }),
    ],
    adapter: MongoDBAdapter(getMongoClientForAuth(), {
        databaseName: 'NextAuth-my-front',
    }),
    secret: authSecret,
};
