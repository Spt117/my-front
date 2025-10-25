"use server";

import { IResponseFetch, getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";

export async function statusKeys(): Promise<IResponseFetch<any>> {
    try {
        const url = pokeUriServer + "/amazon/status-keys";
        const res = await getServer(url);
        return res;
    } catch (error) {
        console.error("Error fetching status keys:", error);
        return { error: "Error fetching status keys", response: null };
    }
}

export async function clearKeys(): Promise<IResponseFetch<any>> {
    try {
        const url = pokeUriServer + "/amazon/clear-keys";
        const res = await getServer(url);
        return res;
    } catch (error) {
        console.error("Error clearing keys:", error);
        return { error: "Error clearing keys", response: null };
    }
}
