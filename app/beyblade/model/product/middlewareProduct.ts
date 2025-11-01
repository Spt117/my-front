"use server";

import { beybladeGenerations, IBeybladeProduct, TBeybladeGeneration } from "../typesBeyblade";
import { beybladeController } from "./productController";

export async function createProductBeyblade(productData: IBeybladeProduct, generation: TBeybladeGeneration) {
    const res = await beybladeController(generation).createBeyblade(productData);
    return JSON.parse(JSON.stringify(res));
}

export async function getProductsToreview() {
    const data: IBeybladeProduct[] = [];
    for (const gen of beybladeGenerations) {
        const product1 = await beybladeController(gen).getBeybladeWithContentToReview();
        product1.map((item) => ({ ...item, generation: gen }));
        data.push(...product1);
        const product2 = await beybladeController(gen).getBeybladeWithEmptyContent();
        product2.map((item) => ({ ...item, generation: gen }));
        data.push(...product2);
        const product3 = await beybladeController(gen).getBeybladeWithoutProductType();
        product3.map((item) => ({ ...item, generation: gen }));
        data.push(...product3);
    }
    return data;
}

export async function deleteBeybladeById(id: string, generation: TBeybladeGeneration) {
    const res = await beybladeController(generation).deleteById(id);
    return res;
}
