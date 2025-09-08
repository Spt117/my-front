"use client";
import { IOrdersDomains } from "@/library/shopify/orders";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import MapOrdersDomains from "./mapOrdersDomains";
import Products from "./ModeProducts/Products";
import { revalidateOrders } from "./serverAction";
import { ProductInOrder } from "./store";

export default function RefreshOders({ products, ordersDomains }: { products: ProductInOrder[]; ordersDomains: IOrdersDomains[] }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGetOrders = async () => {
        setIsLoading(true);
        await revalidateOrders();
        setIsLoading(false);
    };

    return (
        <>
            <RefreshCcw className={`cursor-pointer inline-block mr-2 absolute top-5 left-5 transition-transform duration-300 ease-in-out ${isLoading ? "animate-spin" : ""} hover:scale-125 hover:rotate-45 hover:text-blue-500`} onClick={handleGetOrders} />
            <Products products={products} />
            <MapOrdersDomains ordersDomains={ordersDomains} />
        </>
    );
}
