"use server";

import { postServer } from "@/library/utils/fetchServer";
import { IGetProduct, ITagRequest, ResponseServer } from "./typesShopify";
import { ProductGET } from "@/library/types/graph";

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
