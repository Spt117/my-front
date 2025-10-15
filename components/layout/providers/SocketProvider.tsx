"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEvent } from "@/library/hooks/useEvent/useEvents";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import useUserStore from "@/library/stores/storeUser";
import { uriServerSocket } from "@/library/utils/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { TTopics } from "./utilSocket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const { setSearchTerm, shopifyBoutique } = useShopifyStore();
    const { setSocket } = useUserStore();
    const path = usePathname();
    const { emit } = useEvent();
    const { data: session } = useSession();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        setSearchTerm("");
    }, [path, setSearchTerm]);

    useEffect(() => {
        // pas d'email = pas de socket
        if (!session?.user?.email) return;

        // évite les doublons si l'effet rerun
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const socket = io(uriServerSocket, {
            // Auth/query selon ton backend
            query: { email: session.user.email },
            transports: ["websocket", "polling"],
            // === Reconnexion robuste ===
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000, // 1s -> 2s -> 4s ...
            reconnectionDelayMax: 10000, // cap à 10s
            timeout: 20000, // 20s pour l’handshake
            autoConnect: true,
            withCredentials: true,
        });

        socketRef.current = socket;

        // --- Connexion & (re)subscription ---
        socket.on("connect", () => {
            console.log("[socket] connected", socket.id);
            setSocket(socket);
            // Si ton serveur attend un subscribe après connexion, fais-le ici
            // socket.emit("subscribe:webhooks", { shops: [...] })
        });

        socket.on("connect_error", (err) => {
            console.warn("[socket] connect_error", err.message);
        });

        // --- Gestion des déconnexions ---
        socket.on("disconnect", (reason) => {
            console.warn("[socket] disconnected:", reason);
            // Si la déconnexion vient explicitement du serveur, il faut relancer manuellement
            // (les autres reasons tenteront auto-reconnect)
            if (reason === "io server disconnect") {
                // if (reason === "io server disconnect" || reason === "client namespace disconnect") {
                socket.connect();
            }
        });

        // --- Feedback sur les tentatives de reconnexion ---
        socket.io.on("reconnect_attempt", (attempt) => {
            console.log(`[socket] reconnect_attempt #${attempt}`);
        });
        socket.io.on("reconnect", (attempt) => {
            console.log(`[socket] reconnected after ${attempt} attempt(s)`);
        });
        socket.io.on("reconnect_error", (err) => {
            console.warn("[socket] reconnect_error", err.message);
        });
        socket.io.on("reconnect_failed", () => {
            console.error("[socket] reconnect_failed (no more attempts)");
            // ici tu peux proposer un bouton "Réessayer"
        });

        // --- Tes events métier ---
        socket.on("webhook", (data) => {
            switch (data.topic as TTopics) {
                case "orders/paid": {
                    const boutique = boutiqueFromDomain(data.domain);
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
                    emit("orders/paid", { shop: data.domain });
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
                default:
                    toast.info(`Événement reçu : ${data.topic}`);
                    console.log(data);
                    break;
            }
        });

        // --- Reconnect "pro-actif" au retour de focus/onglet visible ---
        const ensureConnected = () => {
            const s = socketRef.current;
            if (!s) return;
            if (!s.connected) {
                console.log("[socket] ensuring connection on focus/visibility");
                s.connect();
            }
        };

        const onFocus = () => ensureConnected();
        const onVisibility = () => {
            if (!document.hidden) ensureConnected();
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);

        // Cleanup on unmount / email change
        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [session?.user?.email, emit, setSocket, shopifyBoutique?.domain]);

    return <>{children}</>;
}
