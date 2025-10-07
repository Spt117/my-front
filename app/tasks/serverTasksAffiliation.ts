"use server";

import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import { ICreateAffiliationProduct } from "./util";
import { pokeUriServer } from "@/library/utils/uri";
import { postServer } from "@/library/utils/fetchServer";

export async function archiveTaskStatus(id: string) {
    return tasksAffiliationController.updateStatus(id, "done");
}

export async function createProduct(data: ICreateAffiliationProduct<any>[]) {
    const url = `${pokeUriServer}/createContent`;
    const res = await postServer(url, data);
    return res;
}
