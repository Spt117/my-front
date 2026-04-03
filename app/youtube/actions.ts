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

function extractChannelId(input: string): string {
    const trimmed = input.trim();

    // Already a channel ID (UC...)
    if (/^UC[\w-]{22}$/.test(trimmed)) return trimmed;

    // URL: https://www.youtube.com/channel/UC...
    const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return channelMatch[1];

    // URL: https://www.youtube.com/@handle -> not a channel ID, return as-is for user to correct
    // For simplicity, return trimmed and let user provide channel ID
    return trimmed;
}

export async function addYoutubeChannel(channelIdOrUrl: string, channelName: string): Promise<{ success: boolean; error?: string }> {
    const channelId = extractChannelId(channelIdOrUrl);

    if (!channelId || !channelName.trim()) {
        return { success: false, error: "Channel ID et nom requis" };
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
