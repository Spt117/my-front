"use client";

import { setAmazonActivateMetafield } from "@/components/shopify/serverActions";
import { toggleAffiliate } from "@/library/models/variantShopify/middlewareVariants";

// Boutiques Beyblade dont l'affiliation Amazon doit rester synchronisée
// (toggle FR <-> DE). beyblade-toyss reste indépendante.
export const SYNCED_AFFILIATE_DOMAINS = [
    "bayblade-shops.myshopify.com",
    "beyblade-shopde.myshopify.com",
];

export interface AffiliateSyncIds {
    domain: string;
    productId: string;
}

export interface AffiliateSyncResult {
    error?: string;
    message?: string;
    syncFailures: string[];
    missingSisters: string[];
}

interface SetAffiliateParams {
    currentDomain: string;
    currentProductId: string;
    sku: string;
    value: boolean;
    idsOtherShop: AffiliateSyncIds[];
    key?: string;
}

// Met à jour l'affiliation Amazon sur la boutique courante puis, si la
// boutique appartient à l'allowlist beyblade synchro, réplique le toggle
// sur la boutique soeur (best-effort, pas de rollback).
export async function setAffiliateForShops({
    currentDomain,
    currentProductId,
    sku,
    value,
    idsOtherShop,
    key = "amazon_activate",
}: SetAffiliateParams): Promise<AffiliateSyncResult> {
    const result: AffiliateSyncResult = { syncFailures: [], missingSisters: [] };

    toggleAffiliate(currentDomain, sku, value);
    const res = await setAmazonActivateMetafield({
        productId: currentProductId,
        domain: currentDomain,
        key,
        value,
    });
    if (res?.error) {
        result.error = res.error;
        return result;
    }
    if (res?.message) result.message = res.message;

    if (!SYNCED_AFFILIATE_DOMAINS.includes(currentDomain)) return result;

    const sisterDomains = SYNCED_AFFILIATE_DOMAINS.filter((d) => d !== currentDomain);
    for (const sisterDomain of sisterDomains) {
        const sister = idsOtherShop.find((i) => i.domain === sisterDomain);
        if (!sister) {
            result.missingSisters.push(sisterDomain);
            continue;
        }
        try {
            toggleAffiliate(sisterDomain, sku, value);
            const sisterRes = await setAmazonActivateMetafield({
                productId: sister.productId,
                domain: sisterDomain,
                key,
                value,
            });
            if (sisterRes?.error) result.syncFailures.push(sisterDomain);
        } catch {
            result.syncFailures.push(sisterDomain);
        }
    }

    return result;
}
