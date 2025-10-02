import { TDomainsShopify } from "../../../library/params/paramsShopify";
import { ProductGET } from "../../../library/types/graph";

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
interface ProductNode {
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
    domain?: TDomainsShopify;
}

interface IGetProduct {
    productId: string;
    domain: TDomainsShopify;
}

// Export du type pour utilisation
export type { IGetProduct, ProductNode, ProductImage, ProductVariant };
