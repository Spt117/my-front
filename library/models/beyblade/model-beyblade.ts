import { Schema } from "mongoose";
import { IBeybladeProduct } from "./beyblade";

export const BeybladeSchema = new Schema<IBeybladeProduct>(
    {
        product: { type: String, required: true },
        title: { type: String, required: true },
        productCode: { type: String, required: true, index: true },
        generation: { type: String, required: true },
        brand: { type: String, required: true },
        images: { type: [String], required: true },
        releaseDate: { type: Date },
        asinEurope: { type: String },
        asinAmerica: { type: String },
        asinJapan: { type: String },
        content: { type: Schema.Types.Mixed, required: true },
    },
    {
        versionKey: false,
        strict: true,
        timestamps: true,
    }
);
