"use server";

import { IResponseFetch } from "@/library/utils/fetchServer";
import { TTaskShopifyProducts } from "./taskType";
import { TaskShopifyController } from "./taskController";

export async function createTaskShopify(payload: TTaskShopifyProducts): Promise<IResponseFetch<any>> {
    const tasks = await TaskShopifyController.getTaskBySkuAndStockActivation(payload.sku);
    const exists = tasks.find((task) => task.activation === payload.activation);
    if (exists) return { error: "Une tâche avec cette activation existe déjà", response: null };

    const response = await TaskShopifyController.createTask(payload);
    if (response) return { message: "Tâche créée", response };
    else return { error: "Erreur lors de la création de la tâche", response: null };
}

export async function deleteTaskShopify(id: string): Promise<IResponseFetch<any>> {
    const response = await TaskShopifyController.deleteTaskById(id);
    if (response) return { message: "Tâche supprimée", response: null };
    else return { error: "Erreur lors de la suppression de la tâche", response: null };
}
