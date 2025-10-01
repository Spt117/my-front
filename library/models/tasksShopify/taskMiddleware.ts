"use server";

import { IResponseFetch, postServer } from "@/library/utils/fetchServer";
import { TTaskShopifyProducts } from "./taskType";
import { TaskShopifyController } from "./taskController";

export async function createTaskShopify(payload: TTaskShopifyProducts): Promise<IResponseFetch> {
    const response = await TaskShopifyController.createTask(payload);
    if (response) {
        return { message: "Tâche créée", response };
    } else {
        return { error: "Erreur lors de la création de la tâche", response: null };
    }
}
