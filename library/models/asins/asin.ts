import { Schema, model, models, Model } from "mongoose";
import { marketPlaceEnum, TAsin, TMarketPlace } from "./asinType";

const marketPlaceFields = marketPlaceEnum.reduce((acc, marketPlace) => {
    acc[marketPlace] = { type: Boolean, required: false, default: false };
    return acc;
}, {} as Record<TMarketPlace, { type: typeof Boolean; required: boolean; default: boolean }>);

const AsinSchema = new Schema<TAsin>(
    {
        asin: { type: String, required: true, index: true, unique: true },
        title: { type: String, required: false },
        ...marketPlaceFields,
    },
    {
        versionKey: false,
        timestamps: true,
        strict: true,
    }
);

export const Asin: Model<TAsin> = models.asin || model<TAsin>("asin", AsinSchema);
