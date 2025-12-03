import { model, Model, models, Schema } from "mongoose";
import { marketPlaceEnum, TAsin, typeOfProductEnum } from "./asinType";

const AsinSchema = new Schema<TAsin>(
    {
        asin: { type: String, required: true },
        marketPlace: { type: String, enum: marketPlaceEnum, required: true },
        typeOfProduct: { type: String, enum: typeOfProductEnum, required: true },
    },
    {
        versionKey: false,
        timestamps: true,
        strict: true,
    }
);

export const Asin: Model<TAsin> = models.asin || model<TAsin>("asin", AsinSchema);
