import useShopifyStore from "@/components/shopify/shopifyStore";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useEvent } from "../hooks/useEvent/useEvents";
import { boutiqueFromDomain } from "../params/paramsShopify";
import useUserStore from "../stores/storeUser";
import { uriServerSocket } from "../utils/utils";
import { TTopics } from "./utilSocket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const { setSearchTerm, shopifyBoutique } = useShopifyStore();
    const { setSocket } = useUserStore();
    const path = usePathname();
    const { emit } = useEvent();
    const { data: session } = useSession();

    useEffect(() => {
        setSearchTerm("");
    }, [path]);

    useEffect(() => {
        const goSocket = async () => {
            if (!session?.user?.email) return;
            console.log("Attempting to connect to WebSocket server...");
            const socket = io(uriServerSocket, {
                query: {
                    email: session.user.email,
                },
                transports: ["websocket", "polling"], // Ajoute les transports si nécessaire
            });

            socket.on("connect", () => {
                console.log("Connected to WebSocket server");
                setSocket(socket);
            });

            socket.on("webhook", (data) => {
                switch (data.topic as TTopics) {
                    case "orders/paid":
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
                    case "orders/fulfilled":
                        toast.success(`Commande ${data.body.name} expédiée !`);
                        break;
                    case "products/update":
                        console.log(data);

                        if (shopifyBoutique?.domain !== data.domain) return;
                        emit("products/update", {
                            domain: data.domain,
                            sku: data.body.variants[0].sku,
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
        };
        goSocket();
    }, [session?.user?.email]);
    return <>{children}</>;
}
