import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const uriServerSocket = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
if (!uriServerSocket) throw new Error("NEXT_PUBLIC_SOCKET_URL not found.");
