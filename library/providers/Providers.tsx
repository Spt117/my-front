"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { boutiqueFromDomain } from "../params/paramsShopify";
import { socket } from "../utils/utils";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    const { setSearchTerm } = useShopifyStore();
    const path = usePathname();
    const { setEvent } = useShopifyStore();
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

        socket.onAny((eventName, data) => {
            console.log("eventName : ", eventName);
            console.log(data);
            switch (eventName) {
                case "orders/paid":
                    const boutique = boutiqueFromDomain(data.shop);
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
                    setEvent(eventName);
                    break;
                case "orders/fulfilled":
                    toast.success(`Commande ${data.name} expédiée !`);
                    break;
                case "inventory_levels/update":
                    setEvent(eventName);
                    break;
                default:
                    toast.info(`Événement reçu : ${eventName}`);
                    break;
            }
        });
    }, []);

    return <SessionProvider>{children}</SessionProvider>;
}
