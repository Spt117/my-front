// library/auth/authClient.ts
"use server";

import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function getMongoClientForAuth(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }

    // Utilisez votre URI MongoDB (probablement la même que pour mongoose)
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!uri) {
        throw new Error("MongoDB URI is not defined in environment variables");
    }

    cachedClient = new MongoClient(uri);
    await cachedClient.connect();

    return cachedClient;
}
