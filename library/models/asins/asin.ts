import { model, Model, models, Schema } from "mongoose";
import { marketPlaceEnum, TAsin } from "./asinType";

const AsinSchema = new Schema<TAsin>(
    {
        asin: { type: String, required: true },
        marketPlace: { type: String, enum: marketPlaceEnum, required: true },
        active: { type: Boolean, required: true, default: true },
        title: { type: String, required: false },
    },
    {
        versionKey: false,
        timestamps: true,
        strict: true,
    }
);

export const Asin: Model<TAsin> = models.asin || model<TAsin>("asin", AsinSchema);
