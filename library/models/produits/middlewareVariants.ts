"use server";

import { getServer } from "@/library/utils/fetchServer";
import { TVariant } from "./Variant";
import { variantController } from "./variantController";

export async function getStockVariant() {
    const data = await variantController.getVariantRebuy();
    const domain = `bayblade-shops.myshopify.com`;
    const variants: TVariant[] = [];
    for (let variant of data) {
        const ids = variant.ids;
        const id = ids.find((id) => id.shop === "bayblade-shops.myshopify.com")?.idVariant;
        const url = `http://localhost:9100/shopify/stock?domain=${domain}&gid=${id}`;
        const res = await getServer(url);

        if (res && res.response.inventoryQuantity !== undefined) {
            variant.quantity = res.response.inventoryQuantity;
        }
        variants.push(variant);
    }
    return variants;
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
