// Variant.ts
import { TDomainsShopify } from "@/library/params/paramsShopify";
import { Schema, Model, model, models } from "mongoose";

export type TVariant = {
    title: string;
    sku: string;
    rebuy?: boolean;
    rebuyLater?: boolean;
    bought?: boolean;
    price: number;
    compareAtPrice?: number;
    barcode?: string;
    quantity: number;
    ids: { shop: TDomainsShopify; idProduct: string; idVariant: string }[];
};

export const VariantSchema = new Schema<TVariant>(
    {
        title: { type: String, required: true },
        sku: { type: String, required: true, index: true },
        rebuy: { type: Boolean, default: false },
        rebuyLater: { type: Boolean, default: false },
        bought: { type: Boolean, default: false },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        barcode: { type: String },
        quantity: { type: Number, required: true, default: 0 },
        ids: [
            new Schema(
                {
                    shop: { type: String, required: true },
                    idProduct: { type: String, required: true },
                    idVariant: { type: String, required: true },
                },
                { _id: false }
            ),
        ],
    },
    {
        versionKey: false,
        timestamps: true,
        strict: true,
        collection: "variants", // <-- aligne avec ta collection réelle
    }
);

// Laisse ce default model pour l'environnement single-connection éventuel
export const VariantModel: Model<TVariant> = models.variant || model<TVariant>("variant", VariantSchema);
