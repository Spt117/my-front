"use server";

import { beybladeGenerations, IBeybladeProduct, IProductContentItem, TBeybladeGeneration } from "../typesBeyblade";
import { beybladeController } from "./productController";

export async function getProductsToreview() {
    const data: IBeybladeProduct[] = [];
    for (const gen of beybladeGenerations) {
        const product1 = await beybladeController(gen).getBeybladeWithContentToReview();
        const newData: IBeybladeProduct[] = product1.map((item) => ({ ...item, generation: gen }));
        data.push(...newData);
        const product2 = await beybladeController(gen).getBeybladeWithEmptyContent();
        const newData2 = product2.map((item) => ({ ...item, generation: gen }));
        data.push(...newData2);
        const product3 = await beybladeController(gen).getBeybladeWithoutProductType();
        const newData3 = product3.map((item) => ({ ...item, generation: gen }));
        data.push(...newData3);
    }
    return data;
}

export async function deleteBeybladeById(id: string, generation: TBeybladeGeneration) {
    const res = await beybladeController(generation).deleteById(id);
    return res;
}

// ===== CRUD de base ===== //

export async function createProductBeyblade(generation: TBeybladeGeneration, payload: IBeybladeProduct): Promise<{ response: any; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.createBeyblade(payload);
    } catch (err) {
        return { response: null, error: "Server action failed: createBeybladeAction" };
    }
}

export async function getBeybladeProductById(generation: TBeybladeGeneration, id: string): Promise<IBeybladeProduct | null> {
    try {
        const controller = beybladeController(generation);
        return await controller.getItemById(id);
    } catch (err) {
        console.error("getBeybladeByIdAction error:", err);
        return null;
    }
}

export async function getAllBladesAction(generation: TBeybladeGeneration, limit?: number): Promise<IBeybladeProduct[]> {
    try {
        const controller = beybladeController(generation);
        return await controller.getAllBeyblades(limit);
    } catch (err) {
        console.error("getAllBladesAction error:", err);
        return [];
    }
}

export async function deleteBeybladeAction(generation: TBeybladeGeneration, id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.deleteById(id);
    } catch (err) {
        return { success: false, error: "Server action failed: deleteBeybladeAction" };
    }
}

// ===== Mises à jour ===== //

export async function updateBeybladeAction(generation: TBeybladeGeneration, id: string, payload: Partial<IBeybladeProduct>): Promise<{ response: any; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.updateBeybladeById(id, payload);
    } catch (err) {
        return { response: null, error: "Server action failed: updateBeybladeAction" };
    }
}

export async function updateBeybladeFieldAction(generation: TBeybladeGeneration, id: string, field: keyof IBeybladeProduct, value: any): Promise<{ response: any; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.updateBeybladeField(id, field, value);
    } catch (err) {
        return { response: null, error: `Server action failed: updateBeybladeFieldAction (${String(field)})` };
    }
}

// ===== Gestion du contenu ===== //

export async function updateContentItemAction(generation: TBeybladeGeneration, id: string, contentIndex: number, field: keyof IProductContentItem, value: any): Promise<{ response: any; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.updateContentItem(id, contentIndex, { [field]: value });
    } catch (err) {
        return { response: null, error: "Server action failed: updateContentItemAction" };
    }
}

export async function addContentItemAction(generation: TBeybladeGeneration, id: string, newItem: IProductContentItem): Promise<{ response: any; message?: string; error?: string }> {
    try {
        const controller = beybladeController(generation);
        return await controller.addContentItem(id, newItem);
    } catch (err) {
        return { response: null, error: "Server action failed: addContentItemAction" };
    }
}

// ===== Recherche et filtrage ===== //

export async function searchBeybladeAction(generation: TBeybladeGeneration, search: string): Promise<IBeybladeProduct[]> {
    try {
        const controller = beybladeController(generation);
        return await controller.searchBeybladeByProductCodeOrTitle(search);
    } catch (err) {
        console.error("searchBeybladeAction error:", err);
        return [];
    }
}

export async function getBeybladeByProductCodeAction(generation: TBeybladeGeneration, productCode: string): Promise<IBeybladeProduct | null> {
    try {
        const controller = beybladeController(generation);
        return await controller.getBeybladeByProductCode(productCode);
    } catch (err) {
        console.error("getBeybladeByProductCodeAction error:", err);
        return null;
    }
}

export async function getBeybladeWithoutProductTypeAction(generation: TBeybladeGeneration): Promise<IBeybladeProduct[]> {
    try {
        const controller = beybladeController(generation);
        return await controller.getBeybladeWithoutProductType();
    } catch (err) {
        console.error("getBeybladeWithoutProductTypeAction error:", err);
        return [];
    }
}

export async function getBeybladeWithEmptyContentAction(generation: TBeybladeGeneration): Promise<IBeybladeProduct[]> {
    try {
        const controller = beybladeController(generation);
        return await controller.getBeybladeWithEmptyContent();
    } catch (err) {
        console.error("getBeybladeWithEmptyContentAction error:", err);
        return [];
    }
}

export async function getBeybladeWithContentToReviewAction(generation: TBeybladeGeneration): Promise<IBeybladeProduct[]> {
    try {
        const controller = beybladeController(generation);
        return await controller.getBeybladeWithContentToReview();
    } catch (err) {
        console.error("getBeybladeWithContentToReviewAction error:", err);
        return [];
    }
}
