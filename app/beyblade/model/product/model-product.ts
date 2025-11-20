import { Schema } from "mongoose";
import { IBeybladeProduct } from "../typesBeyblade";

export const BeybladeSchema = new Schema<IBeybladeProduct>(
    {
        product: { type: String, required: true },
        title: { type: String, required: true },
        productCode: { type: String, required: true, index: true, unique: true },
        brand: { type: String, required: true },
        system: { type: String, required: true },
        images: { type: [String], required: true },
        releaseDate: { type: Date },
        asinEurope: { type: String },
        asinAmerica: { type: String },
        asinJapan: { type: String },
        content: { type: Number, default: 1 },
    },
    {
        versionKey: false,
        strict: true,
        timestamps: true,
    }
);
