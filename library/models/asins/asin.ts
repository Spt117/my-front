import { Schema, model, models, Model } from "mongoose";

export const marketPlaceEnum = ["amazon.fr", "amazon.de", "amazon.com"] as const;
export type TMarketPlace = (typeof marketPlaceEnum)[number];

type TALerteMarketPlace = {
    endOfAlerte: boolean;
    marketPlace: TMarketPlace;
};

export type TAsin = {
    asin: string;
    title: string;
    alerte: TALerteMarketPlace[];
    createdAt?: Date;
    updatedAt?: Date;
};

const AsinSchema = new Schema<TAsin>(
    {
        asin: { type: String, required: true, index: true, unique: true },
        title: { type: String, required: true },
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
