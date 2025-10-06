"use client";
import { CardHeader } from "@/components/ui/card";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import { sleep } from "@/library/utils/helpers";
import { Archive, ArrowBigLeft, RefreshCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useShopifyStore from "../shopifyStore";
import MappingOrders from "./MappingOrders";
import Products from "./ModeProducts/Products";
import { revalidateOrders } from "./serverAction";
import { ProductInOrder } from "./store";
import ToggleMode from "./ToggleMode";

export default function RefreshOders({ products, orders }: { products: ProductInOrder[]; orders: GroupedShopifyOrder[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const { setShopifyBoutique } = useShopifyStore();
    const path = usePathname();
    const router = useRouter();
    useEventListener("orders/paid", () => handleGetOrders());

    useEffect(() => {
        setShopifyBoutique(null);
    }, []);
    const handleGetOrders = async () => {
        setIsLoading(true);
        await sleep(2000);
        await revalidateOrders();
        setIsLoading(false);
    };

    return (
        <>
            <CardHeader className="sticky top-12 w-full flex justify-center items-center z-10 bg-gray-50 ">
                <div className="relative w-full h-10">
                    {path === "/" && (
                        <>
                            <ToggleMode />
                            <RefreshCcw
                                className={`cursor-pointer inline-block mr-2 absolute top-2 left-5 transition-transform duration-300 ease-in-out ${
                                    isLoading ? "animate-spin" : ""
                                } hover:scale-125 hover:rotate-45 hover:text-blue-500`}
                                onClick={handleGetOrders}
                            />
                        </>
                    )}
                    {path !== "/" && (
                        <ArrowBigLeft
                            className={`cursor-pointer inline-block mr-2 absolute top-2 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                            onClick={() => router.push("/")}
                        />
                    )}
                    {path === "/" && (
                        <Archive
                            className={`cursor-pointer inline-block mr-2 absolute top-2 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                            onClick={() => router.push("/fulfilled")}
                        />
                    )}
                </div>
            </CardHeader>
            <Products products={products} />
            <MappingOrders orders={orders} />
        </>
    );
}
