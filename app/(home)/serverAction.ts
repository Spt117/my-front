'use server';

import { postServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { TDomainsShopify } from '@/params/paramsShopify';

// ============ Types pour les analytics ============
export interface OrderedProduct {
    productId: string;
    title: string;
    sku: string;
    imageUrl: string | null;
    quantity: number;
    revenue: number;
}

export interface AnalyticsData {
    ordersCount: number;
    totalRevenue: number;
    productsCreatedCount: number;
    orderedProducts: OrderedProduct[];
}

export interface AnalyticsRequest {
    domain: TDomainsShopify;
    startDate: string;
    endDate: string;
}

export interface AnalyticsResponse {
    response: AnalyticsData | null;
    message?: string;
    error?: string;
}

/**
 * Récupère les analytics pour une boutique sur une période donnée
 */
export async function getAnalytics(params: AnalyticsRequest): Promise<AnalyticsResponse> {
    const url = `${pokeUriServer}/shopify/analytics`;
    const res = await postServer(url, params);
    return res as AnalyticsResponse;
}
