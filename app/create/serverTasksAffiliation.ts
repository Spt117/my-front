"use server";

import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import { TPublicDomainsShopify } from "@/params/paramsShopify";
import { TDomainWordpress } from "@/params/paramsWordpress";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { ICreateAffiliationProduct } from "./util";

export async function archiveTaskStatus(asin: string, website: TDomainWordpress | TPublicDomainsShopify) {
    return tasksAffiliationController.archiveTask(asin, website);
}

export async function createProductTask(data: ICreateAffiliationProduct<any>) {
    const url = `${pokeUriServer}/createContent`;
    const res = await postServer(url, data);
    return res;
}
