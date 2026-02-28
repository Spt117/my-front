"use server";

import { TVariant } from "../variantShopify/Variant";
import { variantController } from "../variantShopify/variantController";

export async function getStockVariant(domain: string) {
    const data = await variantController(domain).getVariantRebuy();
    return data;
}

export async function getVariantBySku(domain: string, sku: string) {
    const data = await variantController(domain).getVariantBySku(sku);
    return data;
}

export async function toggleRebuy(domain: string, sku: string, rebuy: boolean) {
    const data = await variantController(domain).rebuyBySku(sku, rebuy);
    return data;
}

export async function toggleRebuyLater(domain: string, sku: string, rebuyLater: boolean) {
    if (rebuyLater) await variantController(domain).rebuyBySku(sku, false);
    const data = await variantController(domain).rebuyLaterBySku(sku, rebuyLater);
    return data;
}

export async function toggleBought(domain: string, variant: TVariant, bought: boolean) {
    const data = await variantController(domain).boughtBySku(variant.sku, bought);
    if (bought) {
        if (variant.rebuy) await variantController(domain).rebuyBySku(variant.sku, false);
        if (variant.rebuyLater) await variantController(domain).rebuyLaterBySku(variant.sku, false);
    }
    return data;
}

export async function toggleAffiliate(domain: string, sku: string, active: boolean) {
    const data = await variantController(domain).activeAffiliate(sku, active);
    return data;
}
