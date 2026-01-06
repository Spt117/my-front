'use server';

import { ShopifyCollection, ShopifyCollectionWithProducts } from '@/app/shopify/[shopId]/collections/utils';
import { variantController } from '@/library/models/variantShopify/variantController';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { ProductGET } from '@/library/types/graph';
import { getServer, postServer } from '@/library/utils/fetchServer';
import { TDomainsShopify, TParamsDataShop, boutiqueFromDomain, boutiques } from '@/params/paramsShopify';
import { IGetProduct, IMetafieldRequest, ITagRequest, ResponseServer } from './typesShopify';

export async function getDataBoutique(
    domain: TDomainsShopify,
    param: TParamsDataShop,
    id?: string
): Promise<ResponseServer<string[] | CanauxPublication[] | ShopifyCollection[] | ProductGET[] | ShopifyCollectionWithProducts | null>> {
    const url = `http://localhost:9100/shopify/data-shop?domain=${domain}&param=${param}${id ? `&id=${id}` : ''}`;
    const response = await getServer(url);
    return response;
}

export async function getProduct(data: IGetProduct): Promise<ResponseServer<ProductGET> | null> {
    const url = 'http://localhost:9100/shopify/get-product';
    const response = await postServer(url, data);
    return response;
}

export async function getOrderById(domain: TDomainsShopify, orderId: string): Promise<ResponseServer<GroupedShopifyOrder> | null> {
    const url = 'http://localhost:9100/shopify/get-order-by-id';
    const response = await postServer(url, { domain, orderId });
    return response;
}

export async function deleteTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = 'http://localhost:9100/shopify/delete-tag';
    const response = await postServer(url, data);
    return response;
}
export async function addTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = 'http://localhost:9100/shopify/add-tag';
    const response = await postServer(url, data);
    return response;
}

export async function setAmazonActivateMetafield(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = 'http://localhost:9100/shopify/active-affiliate';
    const response = await postServer(url, data);
    return response;
}

export async function setAsin(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = 'http://localhost:9100/shopify/set-asin';
    const response = await postServer(url, data);
    return response;
}

export interface CanauxPublication {
    id: string;
    name: string;
}

export async function getIdsVariants(domain: TDomainsShopify, sku: string) {
    const boutique = boutiqueFromDomain(domain);
    const boutiquesTiFetch = boutiques.filter((b) => b.niche === boutique.niche);
    const idsVariants: { shop: TDomainsShopify; idVariant: string; idProduct: string }[] = [];
    for (const b of boutiquesTiFetch) {
        const variant = await variantController(b.domain).getVariantBySku(sku);
        if (variant) {
            idsVariants.push({ shop: b.domain, idVariant: variant.idVariant, idProduct: variant.idProduct });
        }
    }
    return idsVariants;
}
export async function deleteLooxReview(domain: TDomainsShopify, productGid: string, reviewIndex: number): Promise<ResponseServer<boolean> | null> {
    const url = 'http://localhost:9100/shopify/delete-loox-review';
    const response = await postServer(url, { domain, productGid, reviewIndex });
    return response;
}
