"use server";

import { TVariant } from "./Variant";
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

export async function toggleBought(variant: TVariant, bought: boolean) {
    const data = await variantController.boughtBySku(variant.sku, bought);
    if (bought) {
        if (variant.rebuy) await variantController.rebuyBySku(variant.sku, false);
        if (variant.rebuyLater) await variantController.rebuyLaterBySku(variant.sku, false);
    }
    return data;
}
