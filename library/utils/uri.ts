if (!process.env.URI_MONGODB) throw new Error("URI_MONGODB is not defined");
else if (!process.env.EMAIL_HOST) throw new Error("EMAIL_HOST is not defined");
else if (!process.env.EMAIL_PORT) throw new Error("EMAIL_PORT is not defined");
else if (!process.env.EMAIL_SERVER) throw new Error("EMAIL_SERVER is not defined");
else if (!process.env.EMAIL_PASSEWORD) throw new Error("EMAIL_PASSEWORD is not defined");
else if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not defined");
else if (!process.env.GOOGLE_ID) throw new Error("GOOGLE_ID is not defined");
else if (!process.env.GOOGLE_SECRET) throw new Error("GOOGLE_SECRET is not defined");
else if (!process.env.URI_SERVER_ACCES) throw new Error("URI_SERVER_ACCES is not defined");
else if (!process.env.USER_EMAIL) throw new Error("USER_EMAIL is not defined");
else if (!process.env.ENCRYPTION_KEY_AMAZON) throw new Error("ENCRYPTION_KEY_AMAZON is not defined");
else if (!process.env.POCKETBASE_URL) throw new Error("POCKETBASE_URL is not defined");
else if (!process.env.ADMIN_EMAIL) throw new Error("ADMIN_EMAIL is not defined");
else if (!process.env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not defined");
else if (!process.env.KEEPA_KEY) throw new Error("KEEPA_KEY is not defined");
else if (!process.env.POKE_API_URL) throw new Error("POKE_API_URL is not defined");
else console.log("All environment variables are defined");

const uriMongodb: string = process.env.URI_MONGODB;
const authSecret: string = process.env.AUTH_SECRET;
const googleId: string = process.env.GOOGLE_ID;
const googleSecret: string = process.env.GOOGLE_SECRET;
const userEmail: string = process.env.USER_EMAIL;
const uriServerAcces: string = process.env.URI_SERVER_ACCES;

export const PB_URL: string = process.env.POCKETBASE_URL;
export const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD;

const encryptedKeyAmazon: string = process.env.ENCRYPTION_KEY_AMAZON;
const keepaKey: string = process.env.KEEPA_KEY;

const email = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    server: process.env.EMAIL_SERVER,
    password: process.env.EMAIL_PASSEWORD,
};

export { authSecret, email, encryptedKeyAmazon, googleId, googleSecret, keepaKey, uriMongodb, uriServerAcces, userEmail };

export const pokeUriServer: string = process.env.POKE_API_URL;
export const telegram = {
    api: `${pokeUriServer}/msgtelegram`,
    dev: "1063455465",
    erreur: "-1002779214968",
    rapports: "-1002830443637",
    logs: "-1002614418286",
};
