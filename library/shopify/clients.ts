import { TDomainsShopify } from '../../params/paramsShopify';
import { GroupedShopifyOrder } from './orders';

export interface ShopMoney {
    amount: string;
    currencyCode: string;
}

export interface MailingAddress {
    id?: string;
    address1: string;
    city: string;
    country: string;
    firstName?: string;
    lastName?: string;
    zip?: string;
    phone?: string;
}

export interface ShopifyCustomer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    numberOfOrders: string;
    amountSpent: ShopMoney;
    defaultAddress?: MailingAddress;
    createdAt: string;
    updatedAt: string;
    note?: string;
    tags: string[];
    shop?: TDomainsShopify;
}

export interface FullShopifyCustomer extends ShopifyCustomer {
    orders: GroupedShopifyOrder[];
}

export interface ShopifyCustomerResponse {
    customers: ShopifyCustomer[];
    hasNextPage: boolean;
    endCursor?: string;
}
