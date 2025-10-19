"use server";

import { boutiqueFromDomain, boutiques, TDomainsShopify, TParamsDataShop } from "@/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { IGetProduct, IMetafieldRequest, ITagRequest, ResponseServer } from "./typesShopify";
import { ShopifyCollection, ShopifyCollectionWithProducts } from "@/app/collections/utils";
import { variantController } from "@/library/models/variantShopify/variantController";

export async function getDataBoutique(domain: TDomainsShopify, param: TParamsDataShop, id?: string): Promise<ResponseServer<string[] | CanauxPublication[] | ShopifyCollection[] | ProductGET[] | ShopifyCollectionWithProducts>> {
    const url = `http://localhost:9100/shopify/data-shop?domain=${domain}&param=${param}${id ? `&id=${id}` : ""}`;
    console.log(url);

    const response = await getServer(url);
    if (response?.error) return { error: response.error, response: [] };
    return { response: response?.response || null };
}

export async function getProduct(data: IGetProduct): Promise<ResponseServer<ProductGET> | null> {
    const url = "http://localhost:9100/shopify/get-product";
    const response = await postServer(url, data);
    return response;
}

export async function deleteTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = "http://localhost:9100/shopify/delete-tag";
    const response = await postServer(url, data);
    return response;
}
export async function addTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = "http://localhost:9100/shopify/add-tag";
    const response = await postServer(url, data);
    return response;
}

export async function setAmazonActivateMetafield(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = "http://localhost:9100/shopify/active-affiliate";
    const response = await postServer(url, data);
    return response;
}

export async function setAsin(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = "http://localhost:9100/shopify/set-asin";
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
