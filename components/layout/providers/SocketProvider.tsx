"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEvent } from "@/library/hooks/useEvent/useEvents";
import useUserStore from "@/library/stores/storeUser";
import { uriServerSocket } from "@/library/utils/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { TTopics } from "./utilSocket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const { shopifyBoutique, allBoutiques } = useShopifyStore();
    const { setSocket } = useUserStore();
    const { emit } = useEvent();
    const { data: session } = useSession();

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!session?.user?.email) return;

        // Réutilise la même socket si déjà créée
        if (!socketRef.current) {
            console.log("Attempting to connect to WebSocket server...");
            const socket = io(uriServerSocket, {
                query: { email: session.user.email },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 20000,
                withCredentials: true,
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("Connected to WebSocket server");
                setSocket(socket);
            });

            socket.on("disconnect", (reason) => {
                // Pas de reconnect manuel ici : l’auto-reconnect de Socket.IO s’en charge,
                // sauf si le serveur a explicitement coupé (io server disconnect)
                if (reason === "io server disconnect") {
                    socket.connect();
                }
            });

            socket.on("webhook", (data) => {
                console.log("Webhook received: ");
                console.log(data);

                switch (data.topic as TTopics) {
                    case "orders/paid": {
                        const boutique = (allBoutiques ?? []).find((b) => b.domain === data.domain);
                        emit("orders/paid", { shop: data.domain });
                        if (!boutique) break;
                        const msg = (
                            <p className="flex items-center gap-1 whitespace-nowrap">
                                Nouvelle commande reçue sur {boutique.vendor}
                                <Image
                                    src={boutique.flag}
                                    alt={boutique.langue}
                                    width={20}
                                    height={20}
                                    className="inline-block ml-1"
                                />
                            </p>
                        );
                        toast.success(msg);
                        break;
                    }
                    case "orders/fulfilled":
                        toast.success(`Commande ${data.body.name} expédiée !`);
                        break;
                    case "products/update":
                        if (shopifyBoutique?.domain !== data.domain) return;
                        emit("products/update", {
                            domain: data.domain,
                            sku: data.body.variants?.[0]?.sku,
                            productId: data.body.id,
                            data: data.body,
                        });
                        break;
                    case "products/create": {
                        const boutiquePc = (allBoutiques ?? []).find((b) => b.domain === data.domain);
                        emit("products/create", {
                            domain: data.domain,
                            sku: data.body.variants?.[0]?.sku,
                            productId: data.body.id,
                            data: data.body,
                        });
                        if (!boutiquePc) break;
                        const msgPc = (
                            <p className="flex items-center gap-1 whitespace-nowrap">
                                Nouveau produit créé sur {boutiquePc.vendor}
                                <Image
                                    src={boutiquePc.flag}
                                    alt={boutiquePc.langue}
                                    width={20}
                                    height={20}
                                    className="inline-block ml-1"
                                />
                            </p>
                        );
                        toast.success(msgPc);
                        break;
                    }
                    default:
                        toast.info(`Événement reçu : ${data.topic}`);
                        console.log(data);
                        break;
                }
            });
        }

        // Reconnect pro-actif au retour sur l’app
        const ensureConnected = () => {
            const s = socketRef.current;
            if (!s) return;
            if (!s.connected) {
                console.log("[socket] reconnect on focus/visibility");
                s.connect();
            }
        };

        const onFocus = () => ensureConnected();
        const onVisibility = () => {
            if (!document.hidden) ensureConnected();
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);

        // Cleanup uniquement quand l'email change / unmount
        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect(); // côté serveur: "client namespace disconnect"
                socketRef.current = null;
            }
        };
    }, [session?.user?.email]);

    return <>{children}</>;
}
