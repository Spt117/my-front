import { TDomainsShopify } from "../params/paramsShopify";
import { ShopifyOrder } from "../shopify/orders";
import { ProductGET } from "./graph";

// Type pour une image de produit
interface ProductImage {
    node: {
        id: string;
        url: string;
        altText: string;
    };
}

// Type pour une variante de produit
interface ProductVariant {
    node: {
        id: string;
        title: string;
        price: string;
        compareAtPrice: string | null;
        sku: string;
        inventoryQuantity: number;
    };
}

// Type principal pour le produit Beyblade
interface IShopifyProductSearch {
    id: string;
    title: string;
    handle: string;
    description: string;
    vendor: string;
    productType: string;
    tags: string[];
    createdAt: string; // Format ISO 8601
    updatedAt: string; // Format ISO 8601
    status: "ACTIVE" | "ARCHIVED" | "DRAFT"; // Statuts Shopify possibles
    images: {
        edges: ProductImage[];
    };
    variants: {
        edges: ProductVariant[];
    };
}

interface IGetProduct {
    productId: string;
    domain: TDomainsShopify;
}

// Export du type pour utilisation
export type { IGetProduct, IShopifyProductSearch, ProductImage, ProductVariant };

export interface IShopifyProductResponse {
    response: ProductGET | null;
    error?: string;
    message?: string;
}
