import { Schema } from "mongoose";
import { TNameMarketplace } from "../../params/paramsAmazon";
import { TPublicDomainsShopify } from "../../params/paramsShopify";
import { TDomainWordpress } from "../../params/paramsWordpress";

export type TAffiliationTask = {
    _id?: string;
    title: string;
    image: string;
    brand?: string;
    asin: string;
    marketplace: TNameMarketplace;
    website: TDomainWordpress | TPublicDomainsShopify;
    status: "pending" | "done" | "error";
    createdAt?: Date;
    updatedAt?: Date;
};

export const createAffiliationTaskSchema = (collectionName: string) => {
    const schema = new Schema<TAffiliationTask>(
        {
            title: { type: String, required: true },
            image: { type: String, required: true },
            asin: { type: String, required: true },
            brand: { type: String, required: false },
            marketplace: { type: String, required: true },
            website: { type: String, required: true },
            status: { type: String, required: true, enum: ["pending", "done", "error"], default: "pending" },
        },
        {
            versionKey: false,
            timestamps: true,
            collection: collectionName,
        }
    );
    return schema;
};
