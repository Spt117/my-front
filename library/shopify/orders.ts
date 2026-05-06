// Types pour l'objet commande Shopify


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

interface VariantImage {
    url: string;
    altText?: string;
}

interface ProductVariant {
    id: string;
    title: string; // Titre de la variante (ex: "Rouge / M", "Default Title")
    price: string;
    image: VariantImage | null; // Image spécifique de la variante
    product: Product;
}

export interface LineItemNode {
    id: string;
    title: string;
    fulfillmentStatus: "unfulfilled" | "fulfilled";
    sku: string;
    quantity: number;
    variant: ProductVariant;
    orderName?: string;
    orderId?: string;
}

interface LineItemEdge {
    node: LineItemNode;
}

interface LineItems {
    edges: LineItemEdge[];
}

export type OrderCancelReason = "CUSTOMER" | "DECLINED" | "FRAUD" | "INVENTORY" | "OTHER" | "STAFF";
export type DisputeStatus = "ACCEPTED" | "LOST" | "NEEDS_RESPONSE" | "UNDER_REVIEW" | "WON" | "CHARGE_REFUNDED";
export type DisputeInitiatedAs = "CHARGEBACK" | "INQUIRY";

export interface OrderDispute {
    id: string;
    status: DisputeStatus;
    initiatedAs: DisputeInitiatedAs;
}

// Type principal pour la commande
export interface ShopifyOrder {
    id: string;
    legacyResourceId: string;
    name: string;
    note: string | null;
    createdAt: string; // Format ISO 8601
    cancelledAt: string | null;
    cancelReason: OrderCancelReason | null;
    disputes: OrderDispute[];
    displayFulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED" | "RESTOCKED" | "PENDING_FULFILLMENT" | "OPEN";
    displayFinancialStatus: "PAID" | "PENDING" | "AUTHORIZED" | "PARTIALLY_PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "VOIDED" | "EXPIRED";
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
    shop: string;
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
    cancelledAt: string | null;
    cancelReason: OrderCancelReason | null;
    disputes: OrderDispute[];
    displayFulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED" | "RESTOCKED" | "PENDING_FULFILLMENT" | "OPEN";
    displayFinancialStatus: "PAID" | "PENDING" | "AUTHORIZED" | "PARTIALLY_PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "VOIDED" | "EXPIRED";
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
    shop: string;
}
