import { IMarketplace } from "@/library/pocketbase/AmazonService";
import { TPublicDomainsShopify } from "@/params/paramsShopify";
import { TDomainWordpress } from "@/params/paramsWordpress";
import { Schema } from "mongoose";

export type TVeille = {
    _id?: string;
    user: string;
    searchTerm: string;
    active: boolean;
    brand?: string;
    marketplace: IMarketplace["domain"];
    count?: number;
    createdAt?: Date;
    updatedAt?: Date;
    website: (TPublicDomainsShopify | TDomainWordpress)[];
};

export const createVeilleSchema = (collectionName: string) => {
    const VeilleSchema = new Schema<TVeille>(
        {
            user: {
                type: String,
                required: true,
            },
            searchTerm: {
                type: String,
                required: true,
            },
            brand: {
                type: String,
                required: false,
            },
            active: {
                type: Boolean,
                required: true,
            },
            marketplace: {
                type: String,
                required: true,
            },
            website: {
                type: [String],
                required: false,
            },
        },
        {
            versionKey: false,
            timestamps: true,
            collection: collectionName,
        }
    );

    return VeilleSchema;
};
