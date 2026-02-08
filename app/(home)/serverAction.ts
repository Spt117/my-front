"use server";

import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { TDomainsShopify } from "@/params/paramsShopify";

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
    draftProductsCount: number;
    orderedProducts: OrderedProduct[];
    productsCreated: any[]; // On peut typer plus finement si nécessaire, mais any[] suffit pour commencer
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

export interface DraftCountItem {
    domain: string;
    count: number;
}

export interface DraftCountResponse {
    response: DraftCountItem[] | null;
    message?: string;
    error?: string;
}

/**
 * Récupère le nombre de produits en brouillon par boutique
 */
export async function getDraftCount(): Promise<DraftCountResponse> {
    const url = `${pokeUriServer}/shopify/draft-count`;
    const res = await fetch(url, { cache: "no-store" });
    return res.json() as Promise<DraftCountResponse>;
}
/**
 * Récupère tous les produits en brouillon de toutes les boutiques
 */
export async function getAllDrafts(): Promise<{ response: any[]; message: string }> {
    const url = `${pokeUriServer}/shopify/all-draft`;
    const res = await fetch(url, { cache: "no-store" });
    return res.json();
}
