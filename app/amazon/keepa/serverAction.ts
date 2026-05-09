"use server";

import { IKeepaSettingsFull, IKeepaWatchRecordFull, keepaWatchService } from "@/library/pocketbase/KeepaWatchService";
import { postServer } from "@/library/utils/fetchServer";
import { pokeUriServer, uriServerAcces } from "@/library/utils/uri";
import { revalidatePath } from "next/cache";

const PATH = "/amazon/keepa";

export type KeepaWatch = IKeepaWatchRecordFull;
export type KeepaSettings = IKeepaSettingsFull;

export async function listKeepaWatches(): Promise<KeepaWatch[]> {
    try {
        return await keepaWatchService.getAll();
    } catch (error) {
        console.error("Erreur récupération watches Keepa:", error);
        return [];
    }
}

export async function getKeepaSettings(): Promise<KeepaSettings | null> {
    try {
        return await keepaWatchService.getSettings();
    } catch (error) {
        console.error("Erreur récupération settings Keepa:", error);
        return null;
    }
}

export async function addKeepaWatch(
    asin: string,
    domainId: number,
): Promise<{ success: boolean; error?: string; warning?: string; tokensLeft?: number }> {
    const result = await postServer(`${pokeUriServer}/keepa/watch/add`, { asin, domainId });
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    return { success: true, warning: (result as any).warning, tokensLeft: (result as any).tokensLeft };
}

export async function toggleKeepaAlert(
    id: string,
    field: "alertRestock" | "alertOutOfStock",
    value: boolean,
): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/keepa/watch/${id}`, { [field]: value });
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    return { success: true };
}

export async function refreshKeepaWatch(
    id: string,
): Promise<{ success: boolean; error?: string; tokensLeft?: number }> {
    const result = await postServer(`${pokeUriServer}/keepa/watch/${id}/refresh`, {});
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    return { success: true, tokensLeft: (result as any).tokensLeft };
}

export async function retryKeepaTracking(id: string): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/keepa/watch/${id}/retry-tracking`, {});
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    return { success: true };
}

export async function deleteKeepaWatch(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${pokeUriServer}/keepa/watch/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${uriServerAcces}`,
            },
        });
        const json = await response.json();
        if (json.error) return { success: false, error: json.error };
        revalidatePath(PATH);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Erreur réseau" };
    }
}

export async function syncKeepaNotifications(): Promise<{
    success: boolean;
    error?: string;
    received?: number;
    handled?: number;
    skipped?: number;
}> {
    const result = await postServer(`${pokeUriServer}/keepa/sync-notifications`, {});
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    const r = result.response || {};
    return { success: true, received: r.received, handled: r.handled, skipped: r.skipped };
}

export async function updateKeepaSettings(
    partial: { fallbackEnabled?: boolean; fallbackIntervalHours?: number },
): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/keepa/settings`, partial);
    if (result.error) return { success: false, error: result.error };
    revalidatePath(PATH);
    return { success: true };
}

export async function resyncKeepaWebhook(): Promise<{ success: boolean; error?: string }> {
    const result = await postServer(`${pokeUriServer}/keepa/settings/sync-webhook`, {});
    if (result.error) return { success: false, error: result.error };
    return { success: true };
}
