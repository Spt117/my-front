"use server";
import { sitesWordpress } from "@/params/paramsWordpress";
import { getBoutiques } from "./ShopifyBoutiqueService";

export async function getWebsites(): Promise<string[]> {
    const shops = await getBoutiques();
    return [...sitesWordpress.map((site) => site.domain), ...shops.map((shop) => shop.publicDomain)].sort();
}
