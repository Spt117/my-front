// Types pour l'objet commande Shopify

import { TDomainsShopify } from '../../params/paramsShopify';

interface ShopMoney {
    amount: string;
    currencyCode: string;
}

interface TotalPriceSet {
    shopMoney: ShopMoney;
}

interface TaxLine {
    title: string;
    rate: number;
    priceSet: TotalPriceSet;
}

interface ShippingLine {
    title: string;
    originalPriceSet: TotalPriceSet;
}

interface Customer {
    id: string;
    email: string;
    numberOfOrders: string;
    amountSpent: ShopMoney;
    firstName?: string;
    lastName?: string;
}

interface ShippingAddress {
    address1: string;
    city: string;
    country: string;
    zip: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
}

interface FeaturedImage {
    url: string;
    altText: string;
}

interface Product {
    id: string;
    featuredImage: FeaturedImage;
    precommande?: {
        value: string;
    };
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
    fulfillmentStatus: 'unfulfilled' | 'fulfilled';
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
    note: string | null;
    createdAt: string; // Format ISO 8601
    displayFulfillmentStatus: 'FULFILLED' | 'UNFULFILLED' | 'PARTIALLY_FULFILLED' | 'RESTOCKED' | 'PENDING_FULFILLMENT' | 'OPEN';
    displayFinancialStatus: 'PAID' | 'PENDING' | 'AUTHORIZED' | 'PARTIALLY_PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'VOIDED' | 'EXPIRED';
    totalPriceSet: TotalPriceSet;
    subtotalLineItemsQuantity: number;
    subtotalPriceSet: TotalPriceSet;
    totalDiscountsSet: TotalPriceSet;
    totalShippingPriceSet: TotalPriceSet;
    totalTaxSet: TotalPriceSet;
    totalReceivedSet: TotalPriceSet;
    discountCodes: string[];
    shippingLines: {
        nodes: ShippingLine[];
    };
    taxLines: TaxLine[];
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
    note: string | null;
    createdAt: string;
    displayFulfillmentStatus: 'FULFILLED' | 'UNFULFILLED' | 'PARTIALLY_FULFILLED' | 'RESTOCKED' | 'PENDING_FULFILLMENT' | 'OPEN';
    displayFinancialStatus: 'PAID' | 'PENDING' | 'AUTHORIZED' | 'PARTIALLY_PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'VOIDED' | 'EXPIRED';
    totalPriceSet: TotalPriceSet;
    subtotalLineItemsQuantity: number;
    subtotalPriceSet: TotalPriceSet;
    totalDiscountsSet: TotalPriceSet;
    totalShippingPriceSet: TotalPriceSet;
    totalTaxSet: TotalPriceSet;
    totalReceivedSet: TotalPriceSet;
    discountCodes: string[];
    shippingLines: {
        nodes: ShippingLine[];
    };
    taxLines: TaxLine[];
    customer: Customer;
    shippingAddress: ShippingAddress;
    lineItems: LineItems;
    shop: TDomainsShopify;
}
