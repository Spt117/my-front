"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { boutiqueFromDomain } from "../params/paramsShopify";
import { socket } from "../utils/utils";
import { useEvent } from "../hooks/useEvent/useEvents";
import { TTopics } from "./utilSocket";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    const { setSearchTerm } = useShopifyStore();
    const path = usePathname();
    // const { setEvent } = useShopifyStore();
    const { emit } = useEvent();
    const router = useRouter();

    useEffect(() => {
        setSearchTerm("");
        router.refresh();
    }, [path]);

    useEffect(() => {
        console.log("Attempting to connect to WebSocket server...");

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.onAny((eventName: TTopics, data) => {
            const msg = `Événement reçu: ${eventName} - de ${data.shop || data.domain || "unknown"}`;
            console.log(msg);

            switch (eventName) {
                case "orders/paid":
                    const boutique = boutiqueFromDomain(data.shop);
                    const msg = (
                        <p className="flex items-center gap-1 whitespace-nowrap">
                            Nouvelle commande reçue sur {boutique.vendor}
                            <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline-block ml-1" />
                        </p>
                    );
                    toast.success(msg);
                    emit("orders/paid", { shop: data.shop });
                    // setEvent(eventName);
                    break;
                case "orders/fulfilled":
                    toast.success(`Commande ${data.name} expédiée !`);
                    break;
                case "products/update":
                    emit("products/update", { domain: data.shop, sku: data.variants[0].sku });
                    break;
                default:
                    toast.info(`Événement reçu : ${eventName}`);
                    break;
            }
        });
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
