"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { socket } from "../utils/utils";
import { boutiqueFromDomain } from "../params/paramsShopify";
import Image from "next/image";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    const { setSearchTerm } = useShopifyStore();
    const path = usePathname();
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
            console.log("eventName :", eventName);
            console.log(data);
            switch (eventName) {
                case "orders/paid":
                    const boutique = boutiqueFromDomain(data.shop);
                    const msg = (
                        <p>
                            Nouvelle commande reçue sur {boutique.vendor} <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" /> !
                        </p>
                    );
                    toast.success(msg);
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
