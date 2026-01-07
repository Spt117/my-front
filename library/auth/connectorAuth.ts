import { MongoClient } from "mongodb";
import { uriMongodb } from "../utils/uri";

let cachedClient: MongoClient | null = null;

export async function getMongoClientForAuth(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }

    cachedClient = new MongoClient(uriMongodb);
    await cachedClient.connect();

    return cachedClient;
}
