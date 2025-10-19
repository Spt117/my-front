// Types pour l'objet commande Shopify

import { TDomainsShopify } from "../../params/paramsShopify";

interface ShopMoney {
    amount: string;
    currencyCode: string;
}

interface TotalPriceSet {
    shopMoney: ShopMoney;
}

interface Customer {
    email: string;
    numberOfOrders: string;
    amountSpent: ShopMoney;
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
    price: string;
    image: null | string; // Peut être null ou une URL d'image
    product: Product;
}

export interface LineItemNode {
    id: string;
    title: string;
    fulfillmentStatus: "unfulfilled" | "fulfilled";
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
export interface ShopifyOrder {
    id: string;
    legacyResourceId: string;
    name: string;
    createdAt: string; // Format ISO 8601
    displayFulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED";
    totalPriceSet: TotalPriceSet;
    customer: Customer;
    shippingAddress: ShippingAddress;
    lineItems: LineItems;
    shop: TDomainsShopify;
}
export interface IShopifyOrderResponse {
    response: ShopifyOrder | null;
    error?: string;
    message?: string;
}

// Interface de sortie avec name comme array de strings
export interface GroupedShopifyOrder {
    id: string;
    legacyResourceId: string[];
    name: string[];
    createdAt: string;
    displayFulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED";
    totalPriceSet: TotalPriceSet;
    customer: Customer;
    shippingAddress: ShippingAddress;
    lineItems: LineItems;
    shop: TDomainsShopify;
}
