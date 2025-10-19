import { Schema } from "mongoose";
import { TDomainsShopify } from "../../../params/paramsShopify";

export type TVariant = {
    title: string;
    sku: string;
    rebuy: boolean;
    rebuyLater: boolean;
    bought?: boolean;
    price: number;
    compareAtPrice?: number | null;
    barcode?: string;
    quantity: number;
    idProduct: string;
    idVariant: string;
    activeAffiliate: boolean;
};

export const VariantSchema = new Schema<TVariant>(
    {
        title: { type: String, required: true },
        sku: { type: String, required: true },
        rebuy: { type: Boolean, required: false, default: false },
        rebuyLater: { type: Boolean, required: false, default: false },
        bought: { type: Boolean, required: false, default: false },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number, required: false, default: null },
        barcode: { type: String, required: false },
        quantity: { type: Number, required: false },
        idProduct: { type: String, required: true },
        idVariant: { type: String, required: true, unique: true },
        activeAffiliate: { type: Boolean, required: true, default: false },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
