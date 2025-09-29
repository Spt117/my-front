import { TDomainsShopify } from "@/library/params/paramsShopify";
import { Model, model, models, Schema } from "mongoose";

interface ids {
    shop: TDomainsShopify;
    idProduct: string;
    idVariant: string;
}

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
    ids: ids[];
};

export const VariantSchema = new Schema<TVariant>(
    {
        title: { type: String, required: true },
        sku: { type: String, required: true },
        rebuy: { type: Boolean, required: false, default: false },
        rebuyLater: { type: Boolean, required: false, default: false },
        bought: { type: Boolean, required: false },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number, required: false },
        barcode: { type: String, required: false },
        quantity: { type: Number, required: false },
        ids: {
            type: [
                new Schema(
                    {
                        shop: { type: String, required: true },
                        idProduct: { type: String, required: true },
                        idVariant: { type: String, required: true },
                    },
                    { _id: false }
                ),
            ],
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const VariantModel: Model<TVariant> = models.variant || model<TVariant>("variant", VariantSchema);
