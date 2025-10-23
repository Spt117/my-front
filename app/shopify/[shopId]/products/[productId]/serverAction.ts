"use server";

import { IDataUpdate } from "@/app/bulk/storeBulk";
import { variantController } from "@/library/models/variantShopify/variantController";
import { ProductGET, ProductVariantNodeGET, TMetafieldKeys } from "@/library/types/graph";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";
import { TFieldProduct, TFieldVariant } from "./util";
import { TVariant } from "@/library/models/variantShopify/Variant";
import { TaskShopifyController } from "@/library/models/tasksShopify/taskController";

export async function updateVariant(
    domain: TDomainsShopify,
    productGid: string,
    variantGid: string,
    field: TFieldVariant,
    value: number | string | boolean
) {
    const url = `${pokeUriServer}/shopify/update-variant`;
    const data = { domain, productGid, variantGid, field, value };
    const response = await postServer(url, data);
    return response;
}
export async function updateSku(domain: TDomainsShopify, id: string, sku: string) {
    const res = await variantController(domain).updateSkuById(id, sku);
    return res;
}

export async function updateProduct(domain: TDomainsShopify, productGid: string, field: TFieldProduct, value: string) {
    const url = `${pokeUriServer}/shopify/update-product`;
    const data = { domain, productGid, field, value };
    const response = await postServer(url, data);
    return response;
}

export async function createProductFromTitle(domain: TDomainsShopify, title: string) {
    const url = `${pokeUriServer}/shopify/create-product-title`;
    const data = { domain, title };
    const response = await postServer(url, data);
    return response;
}

export async function updateCanauxVente(
    domain: TDomainsShopify,
    productId: string,
    items: { id: string; isPublished: boolean }[]
) {
    const url = `${pokeUriServer}/shopify/update-canaux-vente`;
    const data = { domain, productId, items };
    const response = await postServer(url, data);
    return response;
}

export async function bulkUpdateCanauxVente(domain: TDomainsShopify, data: IDataUpdate[]) {
    const url = `${pokeUriServer}/shopify/update-canaux-vente-bulk`;
    const requestData = { domain, data };
    const response = await postServer(url, requestData);
    return response;
}

export async function updateMetafieldGid(domain: TDomainsShopify, productGid: string, metafieldGid: string, value: string) {
    const url = `${pokeUriServer}/shopify/update-metafield`;
    const data = { domain, productGid, metafieldGid, value };
    const response = await postServer(url, data);
    return response;
}
export async function updateMetafieldKey(
    domain: TDomainsShopify,
    productGid: string,
    key: TMetafieldKeys,
    value: string,
    namespace?: string
) {
    const url = `${pokeUriServer}/shopify/update-metafield`;
    const data = { domain, productGid, key, value, namespace };
    const response = await postServer(url, data);
    return response;
}

export async function deleteMetafield(domain: TDomainsShopify, productGid: string, key: string) {
    const url = `${pokeUriServer}/shopify/delete-metafield`;
    const data = { domain, productGid, key };
    const response = await postServer(url, data);
    return response;
}
export async function duplicateProductSameShop(
    domain: TDomainsShopify,
    productGid: string,
    newTitle: string,
    published: boolean
) {
    const url = `${pokeUriServer}/shopify/duplicate-product-same-shop`;
    console.log(url);

    const data = { domain, productGid, newTitle, published };
    const response = await postServer(url, data);
    return response;
}

export async function fetchIdsFromSku(domain: TDomainsShopify, sku: string) {
    const url = `${pokeUriServer}/shopify/get-ids-from-sku?domain=${domain}&sku=${encodeURIComponent(sku)}`;
    const response = await getServer(url);
    return response;
}

export async function fetchVariant(product: ProductGET, domain: TDomainsShopify) {
    const sku = product.variants?.nodes[0].sku;

    let variant = null;

    if (sku) variant = await variantController(domain).getVariantBySku(sku);
    if (!variant && sku && product.variants) {
        const urlOtherShop = `${pokeUriServer}/shopify/create-variant?domain=${domain}&sku=${encodeURIComponent(sku)}`;
        getServer(urlOtherShop);
        const variantProduct = product.variants.nodes[0];
        let activeAmazon = product?.metafields.nodes.find((mf) => mf.key === "amazon_activate");
        const variantData: TVariant = {
            title: product.title,
            sku: variantProduct.sku,
            price: Number(variantProduct.price),
            compareAtPrice: Number(variantProduct.compareAtPrice),
            barcode: variantProduct.barcode || undefined,
            quantity: variantProduct.inventoryQuantity || 0,
            rebuy: false,
            rebuyLater: false,
            bought: false,
            idVariant: variantProduct.id,
            idProduct: product.id,
            activeAffiliate: activeAmazon?.value === "true" ? true : false,
        };
        const response = await variantController(domain).createVariant(variantData);
        variant = response;
    }
    return variant;
}
export async function getTasks(productId: string) {
    const tasks = await TaskShopifyController.getTaskByIdProductAndStockActivation(productId);
    return tasks;
}
