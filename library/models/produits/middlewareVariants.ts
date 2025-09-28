"use server";

import { variantController } from "./variantController";

export async function getStockVariant() {
    const data = await variantController.getVariantRebuy();
    return data;
}

export async function getVariantBySku(sku: string) {
    const data = await variantController.getVariantBySku(sku);
    return data;
}

export async function toggleRebuy(sku: string, rebuy: boolean) {
    const data = await variantController.rebuyBySku(sku, rebuy);
    return data;
}

export async function toggleRebuyLater(sku: string, rebuyLater: boolean) {
    const data = await variantController.rebuyLaterBySku(sku, rebuyLater);
    return data;
}
