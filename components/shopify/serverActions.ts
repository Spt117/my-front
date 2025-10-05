"use server";

import { ProductGET } from "@/library/types/graph";
import { postServer } from "@/library/utils/fetchServer";
import { IGetProduct, IMetafieldRequest, ITagRequest, ResponseServer } from "./typesShopify";
import { TDomainsShopify } from "@/library/params/paramsShopify";

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

export async function getCanauxPublication(domain: TDomainsShopify): Promise<CanauxPublication[]> {
    const url = "http://localhost:9100/shopify/canaux-vente";
    const response = await postServer(url, { domain });
    if (response?.error) return [];
    return response?.response || [];
}
