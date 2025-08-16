import { Schema, model, models, Model } from "mongoose";
import { marketPlaceEnum, TAsin } from "./asinType";

const AsinSchema = new Schema<TAsin>(
    {
        asin: { type: String, required: true, index: true, unique: true },
        title: { type: String, required: false },
        alerte: {
            type: [
                {
                    endOfAlerte: { type: Boolean, required: true },
                    marketPlace: { type: String, enum: marketPlaceEnum, required: true },
                },
            ],
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const Asin: Model<TAsin> = models.asin || model<TAsin>("asin", AsinSchema);
