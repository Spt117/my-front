import mongoose from "mongoose";
import { uriMongodb } from "../utils/uri";

class MongoConnectionManager {
    private connection: mongoose.Connection | null = null;
    private connectionPromise: Promise<mongoose.Connection> | null = null;
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000;

    async getConnection(dbName: string): Promise<mongoose.Connection> {
        // Si une connexion est en cours, attendre qu'elle se termine
        if (this.connectionPromise) {
            const connection = await this.connectionPromise;
            return connection.useDb(dbName);
        }

        // Si la connexion existe et est active, la réutiliser
        if (this.connection && this.isConnectionHealthy(this.connection)) {
            return this.connection.useDb(dbName);
        }

        // Créer une nouvelle connexion
        this.connectionPromise = this.createConnection(uriMongodb);

        try {
            this.connection = await this.connectionPromise;
            this.setupConnectionEventHandlers(this.connection, uriMongodb);
            return this.connection.useDb(dbName);
        } finally {
            this.connectionPromise = null;
        }
    }

    private async createConnection(uri: string): Promise<mongoose.Connection> {
        const options: mongoose.ConnectOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        };

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Attempting to connect to MongoDB (attempt ${attempt}/${this.maxRetries})`);

                const connection = mongoose.createConnection(uri, options);

                // Attendre que la connexion soit établie
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error("Connection timeout"));
                    }, options.serverSelectionTimeoutMS || 5000);

                    connection.once("open", () => {
                        clearTimeout(timeout);
                        resolve();
                    });

                    connection.once("error", (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });

                console.log(`Successfully connected to MongoDB`);
                return connection;
            } catch (error) {
                lastError = error as Error;
                console.error(`Connection attempt ${attempt} failed:`, error);

                if (attempt < this.maxRetries) {
                    console.log(`Retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                } else {
                    // Dernière tentative échouée
                    throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts. Last error: ${lastError.message}`);
                }
            }
        }

        // Cette ligne ne devrait jamais être atteinte, mais pour satisfaire TypeScript
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts`);
    }

    private setupConnectionEventHandlers(connection: mongoose.Connection, uri: string): void {
        connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
            this.connection = null;
        });

        connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
        });

        connection.on("close", () => {
            console.log("MongoDB connection closed");
            this.connection = null;
        });
    }

    private isConnectionHealthy(connection: mongoose.Connection): boolean {
        return connection.readyState === 1; // 1 = connected
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async closeConnection(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }

    getConnectionState(): string {
        if (!this.connection) return "disconnected";

        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };

        return states[this.connection.readyState as keyof typeof states] || "unknown";
    }

    // Pattern Singleton thread-safe
    private static instance: MongoConnectionManager | null = null;
    private static instancePromise: Promise<MongoConnectionManager> | null = null;

    public static async getInstance(): Promise<MongoConnectionManager> {
        if (this.instance) {
            return this.instance;
        }

        if (this.instancePromise) {
            return this.instancePromise;
        }

        this.instancePromise = Promise.resolve(new MongoConnectionManager());
        this.instance = await this.instancePromise;
        this.instancePromise = null;

        return this.instance;
    }

    // Récupérer le client MongoDB sans spécifier de database (pour les adaptateurs)
    async getClientOnly(): Promise<mongoose.mongo.MongoClient> {
        // Pour récupérer juste le client, on utilise une DB temporaire
        const connection = await this.getConnection("temp");
        return connection.getClient();
    }
}

// Factory function pour l'utilisation
export const getMongoConnectionManager = () => MongoConnectionManager.getInstance();

// Fonction helper pour nettoyer les connexions (utile pour les tests et shutdown)
export const closeAllConnections = async (): Promise<void> => {
    const manager = await getMongoConnectionManager();
    await manager.closeConnection();
};
