if (!process.env.URI_MONGODB) throw new Error("URI_MONGODB is not defined");
if (!process.env.EMAIL_HOST) throw new Error("EMAIL_HOST is not defined");
if (!process.env.EMAIL_PORT) throw new Error("EMAIL_PORT is not defined");
if (!process.env.EMAIL_SERVER) throw new Error("EMAIL_SERVER is not defined");
if (!process.env.EMAIL_PASSEWORD) throw new Error("EMAIL_PASSEWORD is not defined");
if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not defined");
if (!process.env.GOOGLE_ID) throw new Error("GOOGLE_ID is not defined");
if (!process.env.GOOGLE_SECRET) throw new Error("GOOGLE_SECRET is not defined");

const uriMongodb: string = process.env.URI_MONGODB;
const authSecret: string = process.env.AUTH_SECRET;
const googleId: string = process.env.GOOGLE_ID;
const googleSecret: string = process.env.GOOGLE_SECRET;

const email = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    server: process.env.EMAIL_SERVER,
    password: process.env.EMAIL_PASSEWORD,
};

export { uriMongodb, authSecret, googleId, googleSecret, email };
