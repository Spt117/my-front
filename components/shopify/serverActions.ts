"use server";

import { ShopifyCollection, ShopifyCollectionWithProducts } from "@/app/shopify/[shopId]/collections/utils";
import { variantController } from "@/library/models/variantShopify/variantController";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import { ProductGET } from "@/library/types/graph";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify, TParamsDataShop, boutiqueFromDomain, boutiques } from "@/params/paramsShopify";
import { IGetProduct, IMetafieldRequest, ITagRequest, ResponseServer } from "./typesShopify";

export async function getDataBoutique(
    domain: TDomainsShopify,
    param: TParamsDataShop,
    id?: string,
): Promise<ResponseServer<string[] | CanauxPublication[] | ShopifyCollection[] | ProductGET[] | ShopifyCollectionWithProducts | null>> {
    const url = `${pokeUriServer}/shopify/data-shop?domain=${domain}&param=${param}${id ? `&id=${id}` : ""}`;
    const response = await getServer(url);
    return response;
}

export async function getProduct(data: IGetProduct): Promise<ResponseServer<ProductGET> | null> {
    const url = `${pokeUriServer}/shopify/get-product`;
    const response = await postServer(url, data);
    return response;
}

export async function getOrderById(domain: TDomainsShopify, orderId: string): Promise<ResponseServer<GroupedShopifyOrder> | null> {
    const url = `${pokeUriServer}/shopify/get-order-by-id`;
    const response = await postServer(url, { domain, orderId });
    return response;
}

export async function deleteTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/delete-tag`;
    const response = await postServer(url, data);
    return response;
}
export async function addTag(data: ITagRequest): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/add-tag`;
    const response = await postServer(url, data);
    return response;
}

export async function setAmazonActivateMetafield(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/active-affiliate`;
    const response = await postServer(url, data);
    return response;
}

export async function setAsin(data: IMetafieldRequest): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/set-asin`;
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
    const url = `${pokeUriServer}/shopify/delete-loox-review`;
    const response = await postServer(url, { domain, productGid, reviewIndex });
    return response;
}

export async function updateMetafield(data: { domain: string; productGid: string; key: string; namespace: string; value: string }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/update-metafield`;
    const response = await postServer(url, data);
    return response;
}

export async function reorderMedia(data: { domain: string; productId: string; moves: { id: string; newPosition: number }[] }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/reorder-media`;
    const response = await postServer(url, data);
    return response;
}

export async function deleteImage(data: { domain: string; mediaId: string }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/delete-image`;
    const response = await postServer(url, data);
    return response;
}

export async function updateMediaAlt(data: { domain: string; productGid: string; mediaId: string; altText: string }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/update-media-alt`;
    const response = await postServer(url, data);
    return response;
}

export async function addImage(data: { domain: string; productId: string; image: { url: string; name: string; altText: string } }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/add-image`;
    const response = await postServer(url, data);
    return response;
}

export async function addImageBase64(data: { domain: string; productId: string; base64Data: string; filename: string; altText: string }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/add-image-base64`;
    const response = await postServer(url, data);
    return response;
}

export async function bulkUpdateStock(data: { domain: string; items: { sku: string; quantity: number }[] }): Promise<ResponseServer<any> | null> {
    const url = `${pokeUriServer}/shopify/bulk-update-stock`;
    const response = await postServer(url, data);
    return response;
}

export async function launchVeille(): Promise<ResponseServer<string> | null> {
    const url = `${pokeUriServer}/amazon/veille-launch`;
    const response = await getServer(url);
    return response;
}

export async function rebootVeilleAction(): Promise<ResponseServer<string> | null> {
    const url = `${pokeUriServer}/veille-action`;
    const response = await getServer(url);
    return response;
}

export async function updateCanauxVente(domain: string, productId: string, items: { id: string; isPublished: boolean }[]) {
    const url = `${pokeUriServer}/shopify/update-canaux-vente`;
    const data = { domain, productId, items };
    const response = await postServer(url, data);
    return response;
}
