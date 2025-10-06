import { Schema } from "mongoose";

export type TVeilleProduct = {
    asin: string;
    title: string;
    image: string;
    price: number;
    description: string[];
    createdAt?: string;
};

export const createVeilleProductSchema = (collectionName: string) => {
    const schema = new Schema<TVeilleProduct>(
        {
            asin: { type: String, required: true },
            title: { type: String, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: [String], required: true },
        },

        {
            versionKey: false,
            timestamps: true,
            collection: collectionName,
        }
    );

    return schema;
};
