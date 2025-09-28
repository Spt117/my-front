import { TDomainsShopify } from "@/library/params/paramsShopify";

export interface IGetProduct {
    productId: string;
    domain: TDomainsShopify;
}

export interface ITagRequest extends IGetProduct {
    tag: string;
}
export interface IMetafieldRequest extends IGetProduct {
    value: boolean | string;
    key: string;
}

export interface ResponseServer<T> {
    response: T;
    error?: string;
    message?: string;
}
