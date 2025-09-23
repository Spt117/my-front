import { getMongoConnectionManager } from "@/library/auth/connector";
import { TDomainMarketplace } from "@/library/params/paramsAmazon";
import { encryptedKeyAmazon } from "@/library/utils/uri";
import crypto from "crypto";
import { model, Model, models, Schema } from "mongoose";

export type TAmazonKeys = {
    marketplace: TDomainMarketplace;
    accessKeyId: string;
    secretAccessKey: string;
    iv?: string;
};

const schemaAmazonKeys = new Schema<TAmazonKeys>(
    {
        marketplace: { type: String, required: true },
        accessKeyId: { type: String, required: true },
        secretAccessKey: { type: String, required: true },
        iv: { type: String, required: true },
    },
    {
        versionKey: false,
        timestamps: true,
        collection: "amazon_keys",
    }
);
const AmazonKeysModel: Model<TAmazonKeys> = models.amazon_keys || model<TAmazonKeys>("amazon_keys", schemaAmazonKeys);

class ControllerAmazonKeys {
    private readonly ENCRYPTION_KEY = encryptedKeyAmazon; // 32 caractères
    private readonly ALGORITHM = "aes-256-cbc";

    private encryptSecretKey(secretKey: string): { encrypted: string; iv: string } {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(secretKey, "utf8", "hex");
        encrypted += cipher.final("hex");
        return {
            encrypted,
            iv: iv.toString("hex"),
        };
    }

    private static instance: ControllerAmazonKeys;
    public static getInstance(): ControllerAmazonKeys {
        if (!ControllerAmazonKeys.instance) {
            ControllerAmazonKeys.instance = new ControllerAmazonKeys();
        }
        return ControllerAmazonKeys.instance;
    }

    private async getModel(): Promise<Model<TAmazonKeys>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Pokemon");
        return connection.model<TAmazonKeys>("amazon_keys", AmazonKeysModel.schema);
    }

    private async addOrUpdateKey(keys: TAmazonKeys): Promise<TAmazonKeys | null> {
        try {
            const model = await this.getModel();
            const existing = await model.findOne({ marketplace: keys.marketplace }).lean();
            if (existing) {
                existing.accessKeyId = keys.accessKeyId;
                existing.secretAccessKey = keys.secretAccessKey;
                await model.updateOne({ marketplace: keys.marketplace }, keys);
                return existing;
            } else {
                const newKey = new model(keys);
                await newKey.save();
                return newKey.toObject();
            }
        } catch (e) {
            console.log("Erreur lors de l'ajout/mise à jour des clés Amazon:", e);
            return null;
        }
    }

    public async addOrUpdateKeyWithEncryption(
        keys: TAmazonKeys
    ): Promise<{ message?: string; response?: TAmazonKeys | null; error?: string }> {
        try {
            if (!this.ENCRYPTION_KEY || this.ENCRYPTION_KEY.length !== 32) {
                console.log(this.ENCRYPTION_KEY);
                return { error: "Clé de chiffrement invalide. Elle doit faire 32 caractères." };
            }
            const { encrypted, iv } = this.encryptSecretKey(keys.secretAccessKey);
            const keysToStore: TAmazonKeys = { ...keys, secretAccessKey: encrypted, iv };
            const result = await this.addOrUpdateKey(keysToStore);
            if (result) return { message: "Clés Amazon ajoutées/mises à jour avec succès", response: result };
            return { response: null, error: "Erreur lors de l'ajout/mise à jour des clés Amazon" };
        } catch (e) {
            return { response: null, error: "Erreur lors de l'ajout/mise à jour des clés Amazon avec chiffrement" };
        }
    }
}

export const controllerAmazonKeys = ControllerAmazonKeys.getInstance();
