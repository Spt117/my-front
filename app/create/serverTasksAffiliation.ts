'use server';

import { tasksAffiliationController } from '@/library/models/tasksAffiliation/tasksAffiliationController';
import { ProductGET } from '@/library/types/graph';
import { IResponseFetch, postServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { TPublicDomainsShopify } from '@/params/paramsShopify';
import { TDomainWordpress } from '@/params/paramsWordpress';
import { ICreateAffiliationProduct } from './util';

export async function archiveTaskStatus(asin: string, website: TDomainWordpress | TPublicDomainsShopify) {
    return tasksAffiliationController.archiveTask(asin, website);
}

export async function createProductTask(data: ICreateAffiliationProduct<any>) {
    const url = `${pokeUriServer}/createContent`;
    const res = await postServer(url, data);
    return res;
}

export async function createCarte(asin: string): Promise<IResponseFetch<ProductGET>> {
    const url = `${pokeUriServer}/createContent/carte`;
    const res = await postServer(url, { asin });
    return res;
}
