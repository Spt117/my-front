import { io } from "socket.io-client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const uriServer = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
if (!uriServer) throw new Error("NEXT_PUBLIC_SOCKET_URL not found.");

export const socket = io(uriServer, {
    transports: ["websocket", "polling"], // Ajoute les transports si nécessaire
});
