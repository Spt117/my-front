import { TDomainsShopify } from "@/params/paramsShopify";

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

export interface IBulkProductsAction<T extends string = string> {
    productsId: string[];
    domain: TDomainsShopify;
    actionType: T;
}

export interface ITagBulkAction extends IBulkProductsAction<"tag"> {
    tag: string;
    type: "add" | "remove";
}

export interface IPriceBulkAction extends IBulkProductsAction<"price"> {
    price: number;
}

export interface ICollectionBulkAction extends IBulkProductsAction<"collection"> {
    collectionGid: string;
    type: "add" | "remove";
}
export type BulkAction = ITagBulkAction | IPriceBulkAction | ICollectionBulkAction;
