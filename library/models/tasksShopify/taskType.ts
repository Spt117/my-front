import { Schema } from "mongoose";
import { TDomainsShopify } from "../../params/paramsShopify";

const taskStatus = ["scheduled", "done", "error", "canceled", "running"] as const;
export type TStatusTask = (typeof taskStatus)[number];
const activationTypes = ["timestamp", "quantity"] as const;
export type TActivationType = (typeof activationTypes)[number];

export type TTaskShopifyProducts = {
    _id?: string;
    status: TStatusTask;
    activation: TActivationType;
    timestampActivation: number;
    stockActivation: number;
    sku: string;
    boutique: TDomainsShopify;
    priceUpdate: number;
    compareAtPrice?: number;
};

export const TaskSchema = new Schema<TTaskShopifyProducts>(
    {
        status: { type: String, required: true },
        activation: { type: String, required: true },
        timestampActivation: { type: Number, required: false },
        stockActivation: { type: Number, required: false },
        sku: { type: String, required: true },
        boutique: { type: String, required: true },
        priceUpdate: { type: Number, required: false },
        compareAtPrice: { type: Number, required: false },
    },
    {
        versionKey: false,
    }
);
