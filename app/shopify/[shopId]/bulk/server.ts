"use server";
import { BulkAction, ResponseServer } from "@/components/shopify/typesShopify";
import { ProductGET } from "@/library/types/graph";
import { IResponseFetch, getServer, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function SearchByTag(tag: string, domain: string): Promise<IResponseFetch<ProductGET[]>> {
    const url = `${pokeUriServer}/shopify/search-by-tag?tag=${encodeURIComponent(tag)}&domain=${encodeURIComponent(domain)}`;
    const response = await getServer(url);
    return response;
}

export async function addProductsToCollection(domain: string, collectionGid: string, productGids: string[]): Promise<IResponseFetch<null>> {
    const url = `${pokeUriServer}/shopify/add-products-to-collection`;
    const data = { domain, collectionGid, productGids };
    const response = await postServer(url, data);
    return response;
}

export async function actionBulk(data: BulkAction): Promise<ResponseServer<any>> {
    const url = `${pokeUriServer}/shopify/bulk`;
    const response = await postServer(url, data);
    return response;
}

export interface SearchProductsAdvancedPayload {
    domain: string;
    query: string;
    first?: number;
    after?: string;
    sortKey?: "TITLE" | "CREATED_AT" | "UPDATED_AT" | "VENDOR" | "PRODUCT_TYPE";
    reverse?: boolean;
}

export interface SearchProductsAdvancedResult {
    products: ProductGET[];
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
    };
}

// Wrapper du nouvel endpoint pokemon /shopify/search-products-advanced.
// La query Shopify est composée côté client (cf. bulkQuery.ts/buildShopifyQuery).
export async function searchProductsAdvanced(payload: SearchProductsAdvancedPayload): Promise<IResponseFetch<SearchProductsAdvancedResult>> {
    const url = `${pokeUriServer}/shopify/search-products-advanced`;
    const response = await postServer(url, payload);
    return response;
}
