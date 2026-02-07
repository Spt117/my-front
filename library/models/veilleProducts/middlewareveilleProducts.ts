"use server";

import { IMarketplace } from "@/library/pocketbase/AmazonService";
import { TVeilleProduct } from "./veilleProducts";
import { listVeilleController } from "./veilleProductsController";

export async function getVeilleProducts(marketplace: IMarketplace, collectionName: string): Promise<TVeilleProduct[]> {
    return await listVeilleController(marketplace, collectionName).getFullList();
}

export async function deleteVeilleProducts(marketplace: IMarketplace, collectionName: string): Promise<boolean> {
    return await listVeilleController(marketplace, collectionName).dropCollection();
}
