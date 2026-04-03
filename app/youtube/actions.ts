"use server";

import { pocketBaseManager } from "@/library/pocketbase/Manager";
import { postServer } from "@/library/utils/fetchServer";
import { deployUriServer } from "@/library/utils/uri";

export interface IYoutubeChannel {
    id: string;
    channel_id: string;
    channel_name: string;
    is_active: boolean;
    lease_expires_at: string;
    last_video_id: string;
    last_notified_at: string;
    created: string;
    updated: string;
}

export async function getYoutubeChannels(): Promise<IYoutubeChannel[]> {
    await pocketBaseManager.ensureAdmin();
    const records = await pocketBaseManager.pb.collection("youtube_channels").getFullList({
        sort: "-created",
    });
    return records as unknown as IYoutubeChannel[];
}

async function resolveYoutubeChannel(input: string): Promise<{ channelId: string; channelName: string } | null> {
    const trimmed = input.trim();

    // Already a channel ID (UC...)
    if (/^UC[\w-]{22}$/.test(trimmed)) {
        return { channelId: trimmed, channelName: "" };
    }

    // URL with channel ID: youtube.com/channel/UC...
    const directMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    if (directMatch) {
        return { channelId: directMatch[1], channelName: "" };
    }

    // Normalize input: "ledevultime" or "@ledevultime" -> full YouTube URL
    let targetUrl: string | null = null;

    if (trimmed.includes("youtube.com/")) {
        targetUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    } else {
        // Handle bare handle: "ledevultime" or "@ledevultime"
        const handle = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
        targetUrl = `https://www.youtube.com/${handle}`;
    }

    if (targetUrl) {
        try {
            const res = await fetch(targetUrl, {
                headers: { "Accept-Language": "fr-FR,fr;q=0.9" },
                redirect: "follow",
            });
            const html = await res.text();

            // Extract channel ID from meta tag or page source
            const cidMatch = html.match(/"channelId":"(UC[\w-]{22})"/) ||
                html.match(/<meta\s+itemprop="channelId"\s+content="(UC[\w-]{22})"/) ||
                html.match(/"externalId":"(UC[\w-]{22})"/);

            // Extract channel name
            const nameMatch = html.match(/"author":"([^"]+)"/) ||
                html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) ||
                html.match(/<link\s+itemprop="name"\s+content="([^"]+)"/);

            if (cidMatch) {
                return {
                    channelId: cidMatch[1],
                    channelName: nameMatch ? nameMatch[1] : "",
                };
            }
        } catch (err) {
            console.error("[YouTube] Error resolving channel URL:", err);
        }
    }

    return null; // unreachable but satisfies TS
}

export async function addYoutubeChannel(urlOrId: string, channelNameOverride?: string): Promise<{ success: boolean; error?: string }> {
    const resolved = await resolveYoutubeChannel(urlOrId);

    if (!resolved) {
        return { success: false, error: "Impossible de trouver le Channel ID. Verifiez l'URL." };
    }

    const { channelId, channelName: resolvedName } = resolved;
    const channelName = channelNameOverride?.trim() || resolvedName;

    if (!channelName) {
        return { success: false, error: "Nom de la chaine introuvable. Ajoutez-le manuellement." };
    }

    try {
        await pocketBaseManager.ensureAdmin();

        // Check if channel already exists
        try {
            await pocketBaseManager.pb.collection("youtube_channels").getFirstListItem(`channel_id = "${channelId}"`);
            return { success: false, error: "Cette chaine est deja surveillee" };
        } catch {
            // Not found = OK, proceed
        }

        // Create record in PocketBase
        await pocketBaseManager.pb.collection("youtube_channels").create({
            channel_id: channelId,
            channel_name: channelName.trim(),
            is_active: true,
        });

        // Trigger WebSub subscription via Deploy
        if (deployUriServer) {
            await postServer(`${deployUriServer}/youtube/subscribe`, { channel_id: channelId });
        }

        return { success: true };
    } catch (err: any) {
        console.error("[YouTube] Error adding channel:", err);
        return { success: false, error: err.message || "Erreur interne" };
    }
}

export async function removeYoutubeChannel(recordId: string, channelId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Unsubscribe from WebSub
        if (deployUriServer) {
            await postServer(`${deployUriServer}/youtube/unsubscribe`, { channel_id: channelId });
        }

        // Delete from PocketBase
        await pocketBaseManager.ensureAdmin();
        await pocketBaseManager.pb.collection("youtube_channels").delete(recordId);

        return { success: true };
    } catch (err: any) {
        console.error("[YouTube] Error removing channel:", err);
        return { success: false, error: err.message || "Erreur interne" };
    }
}

export async function toggleYoutubeChannel(recordId: string, channelId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        await pocketBaseManager.ensureAdmin();
        await pocketBaseManager.pb.collection("youtube_channels").update(recordId, { is_active: isActive });

        // Subscribe or unsubscribe based on new state
        if (deployUriServer) {
            const endpoint = isActive ? "subscribe" : "unsubscribe";
            await postServer(`${deployUriServer}/youtube/${endpoint}`, { channel_id: channelId });
        }

        return { success: true };
    } catch (err: any) {
        console.error("[YouTube] Error toggling channel:", err);
        return { success: false, error: err.message || "Erreur interne" };
    }
}
