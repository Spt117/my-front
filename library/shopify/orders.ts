// Types pour l'objet commande Shopify

import { TDomainsShopify } from "../params/paramsShopify";

interface ShopMoney {
    amount: string;
    currencyCode: string;
}

interface TotalPriceSet {
    shopMoney: ShopMoney;
}

interface Customer {
    email: string;
}

interface ShippingAddress {
    address1: string;
    city: string;
    country: string;
}

interface FeaturedImage {
    url: string;
    altText: string;
}

interface Product {
    id: string;
    featuredImage: FeaturedImage;
}

interface ProductVariant {
    id: string;
    image: null | string; // Peut être null ou une URL d'image
    product: Product;
}

export interface LineItemNode {
    id: string;
    title: string;
    sku: string;
    quantity: number;
    variant: ProductVariant;
}

interface LineItemEdge {
    node: LineItemNode;
}

interface LineItems {
    edges: LineItemEdge[];
}

// Type principal pour la commande
interface ShopifyOrder {
    id: string;
    legacyResourceId: string;
    name: string;
    createdAt: string; // Format ISO 8601
    displayFulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED";
    totalPriceSet: TotalPriceSet;
    customer: Customer;
    shippingAddress: ShippingAddress;
    lineItems: LineItems;
}

interface IOrdersDomains {
    shop: TDomainsShopify;
    orders: ShopifyOrder[];
}

// Export du type principal
export type { ShopifyOrder, IOrdersDomains };
