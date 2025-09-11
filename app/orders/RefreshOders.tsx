"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import { sleep } from "@/library/utils/helpers";
import { Archive, ArrowBigLeft, RefreshCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MappingOrders from "./MappingOrders";
import Products from "./ModeProducts/Products";
import { revalidateOrders } from "./serverAction";
import { ProductInOrder } from "./store";
import ToggleMode from "./ToggleMode";

export default function RefreshOders({ products, orders }: { products: ProductInOrder[]; orders: GroupedShopifyOrder[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const path = usePathname();
    const { event, setEvent, setShopifyBoutique } = useShopifyStore();
    const router = useRouter();

    const handleGetOrders = async () => {
        setIsLoading(true);
        await sleep(2000);
        await revalidateOrders();
        setIsLoading(false);
    };

    useEffect(() => {
        setShopifyBoutique(null);
        if (event === "orders/paid") {
            setEvent(null);
            handleGetOrders();
        }
    }, [event]);

    return (
        <>
            <div className="sticky w-full flex justify-center items-center mb-3 z-10">
                <ToggleMode />
                {path === "/orders" && (
                    <RefreshCcw
                        className={`cursor-pointer inline-block mr-2 absolute top-5 left-5 transition-transform duration-300 ease-in-out ${
                            isLoading ? "animate-spin" : ""
                        } hover:scale-125 hover:rotate-45 hover:text-blue-500`}
                        onClick={handleGetOrders}
                    />
                )}
                {path !== "/orders" && (
                    <ArrowBigLeft
                        className={`cursor-pointer inline-block mr-2 absolute top-5 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                        onClick={() => router.push("/orders")}
                    />
                )}
                {path === "/orders" && (
                    <Archive
                        className={`cursor-pointer inline-block mr-2 absolute top-5 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                        onClick={() => router.push("/orders/fulfilled")}
                    />
                )}
            </div>
            <Products products={products} />
            <MappingOrders orders={orders} />
        </>
    );
}
