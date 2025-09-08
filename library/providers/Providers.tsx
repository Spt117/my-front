"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "../utils/utils";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    const path = usePathname();
    const router = useRouter();

    useEffect(() => {
        router.refresh();
    }, [path]);

    useEffect(() => {
        console.log("Attempting to connect to WebSocket server...");

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.onAny((eventName, data) => {
            console.log("📡 Événement reçu:", {
                event: eventName,
                data: data,
                timestamp: new Date().toISOString(),
            });
            router.refresh();
        });
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
