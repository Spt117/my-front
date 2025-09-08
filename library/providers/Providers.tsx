"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
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
            console.log("eventName :", eventName);
            console.log(data);
            switch (eventName) {
                case "orders/paid":
                    toast.success(`Nouvelle commande reçue !`);
                    break;
                case "orders/fulfilled":
                    toast.success(`Commande ${data.name} expédiée !`);
                    break;
                default:
                    toast.info(`Événement reçu : ${eventName}`);
                    break;
            }
        });
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
