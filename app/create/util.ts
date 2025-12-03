import { TAffiliationTask } from '@/library/models/tasksAffiliation/tasksAffiliation';
import { TNameMarketplace } from '@/params/paramsAmazon';
import { TBeybladeProducts, TPokemonProducts } from '@/params/paramsCreateAffiliation';
import { TPublicDomainsShopify } from '@/params/paramsShopify';
import { TDomainWordpress } from '@/params/paramsWordpress';

export interface ICreateAffiliationProduct<T> {
    idTask?: string;
    website: TDomainWordpress | TPublicDomainsShopify;
    marketplace: TNameMarketplace;
    product: TPokemonProducts | TBeybladeProducts;
    asin: string;
    data: T;
}

export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export interface TaskDetailsProps {
    task: TAffiliationTask;
}
