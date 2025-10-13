"use server";

import { TDomainsShopify, TParamsDataShop } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { IGetProduct, IMetafieldRequest, ITagRequest, ResponseServer } from "./typesShopify";
import { ShopifyCollection } from "@/app/collections/utils";
import { url } from "inspector";

export async function getDataBoutique(
    domain: TDomainsShopify,
    param: TParamsDataShop
): Promise<ResponseServer<string[] | CanauxPublication[] | ShopifyCollection[] | ProductGET[]>> {
    const url = `http://localhost:9100/shopify/data-shop?domain=${domain}&param=${param}`;
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
