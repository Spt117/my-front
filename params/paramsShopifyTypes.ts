// Types-only file — no server dependencies, safe to import from client components

const languesTraductions = ['français', 'anglais', 'espagnol', 'allemand'] as const;
export type TLangueTraduction = (typeof languesTraductions)[number];

export interface IShopifyBase {
    vendor: string;
    domain: string;
    publicDomain: string;
    locationHome: number;
    langue: TLangueTraduction;
    flag: string;
    devise: string;
    marketplaceAmazon: string;
    niche: string;
    id: number;
}

export type TDomainsShopify = string;
export type TPublicDomainsShopify = string;
export type TVendorsShopify = string;
export type TLocationHome = number;
export type TMarketplaceAmazonBoutique = string;

export type IShopify = IShopifyBase;

export const apiVersion = '2024-01';

const paramsDataShop = ['tags', 'productTypes', 'collections', 'salesChannels', 'productsMissingChannels', 'collectionGid'] as const;
export type TParamsDataShop = (typeof paramsDataShop)[number];
