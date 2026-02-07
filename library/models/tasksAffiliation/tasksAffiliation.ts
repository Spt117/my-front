import { Schema } from "mongoose";
import { TPublicDomainsShopify } from "../../../params/paramsShopify";
import { TDomainWordpress } from "../../../params/paramsWordpress";
import { TPokemonProducts } from "@/params/paramsCreateAffiliation";

export type TAffiliationTask = {
    _id?: string;
    title: string;
    image: string;
    price?: number;
    seller?: string;
    brand?: string;
    asin: string;
    productType: TPokemonProducts;
    marketplace: string;
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
            seller: { type: String, required: false },
            price: { type: Number, required: false },
            productType: { type: String, required: true },
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
