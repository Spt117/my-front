"use client";
import { IOrdersDomains } from "@/library/shopify/orders";
import { socket } from "@/library/utils/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MapOrdersDomains from "./mapOrdersDomains";
import Products from "./ModeProducts/Products";
import { ProductInOrder } from "./store";

export default function SocketOrder({ products, ordersDomains }: { products: ProductInOrder[]; ordersDomains: IOrdersDomains[] }) {
    const router = useRouter();

    useEffect(() => {
        console.log("Attempting to connect to WebSocket server...");

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.onAny((eventName, data) => {
            console.log("📡 Événement reçu sur SocketOrder");
            console.log("eventName :", eventName);
            console.log(data);
            router.refresh();
        });
    }, []);

    return (
        <>
            <Products products={products} />
            <MapOrdersDomains ordersDomains={ordersDomains} />
        </>
    );
}
