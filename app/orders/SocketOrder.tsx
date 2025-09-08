"use client";
import { IOrdersDomains } from "@/library/shopify/orders";
import { socket } from "@/library/utils/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MapOrdersDomains from "./mapOrdersDomains";
import Products from "./ModeProducts/Products";
import { ProductInOrder } from "./store";
import { sleep } from "@/library/utils/helpers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SocketOrder({ products, ordersDomains }: { products: ProductInOrder[]; ordersDomains: IOrdersDomains[] }) {
    const router = useRouter();

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

    const handleGetOrders = async () => {
        await sleep(500);
        router.refresh();
    };

    return (
        <>
            <Button onClick={handleGetOrders} className="mb-4">
                Rafraîchir les commandes
            </Button>
            <Products products={products} />
            <MapOrdersDomains ordersDomains={ordersDomains} />
        </>
    );
}
