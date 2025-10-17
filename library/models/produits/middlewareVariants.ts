"use server";

import { TDomainsShopify } from "@/library/params/paramsShopify";
import { TVariant } from "../variantShopify/Variant";
import { variantController } from "../variantShopify/variantController";

export async function getStockVariant(domain: TDomainsShopify) {
    const data = await variantController(domain).getVariantRebuy();
    return data;
}

export async function getVariantBySku(domain: TDomainsShopify, sku: string) {
    const data = await variantController(domain).getVariantBySku(sku);
    return data;
}

export async function toggleRebuy(domain: TDomainsShopify, sku: string, rebuy: boolean) {
    const data = await variantController(domain).rebuyBySku(sku, rebuy);
    return data;
}

export async function toggleRebuyLater(domain: TDomainsShopify, sku: string, rebuyLater: boolean) {
    if (rebuyLater) await variantController(domain).rebuyBySku(sku, false);
    const data = await variantController(domain).rebuyLaterBySku(sku, rebuyLater);
    return data;
}

export async function toggleBought(domain: TDomainsShopify, variant: TVariant, bought: boolean) {
    const data = await variantController(domain).boughtBySku(variant.sku, bought);
    if (bought) {
        if (variant.rebuy) await variantController(domain).rebuyBySku(variant.sku, false);
        if (variant.rebuyLater) await variantController(domain).rebuyLaterBySku(variant.sku, false);
    }
    return data;
}
