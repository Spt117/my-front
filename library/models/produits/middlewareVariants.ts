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
    await variantController.rebuyBySku(sku, rebuy);
    const data = await getStockVariant();
    return data;
}

export async function toggleRebuyLater(sku: string, rebuyLater: boolean) {
    await variantController.rebuyLaterBySku(sku, rebuyLater);
    const data = await getStockVariant();
    return data;
}
