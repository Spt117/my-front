"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import Image from "next/image";
import { useState } from "react";

interface DataShops {
    count: number;
    products: ProductGET[];
}

export default function ShopifyTab() {
    const [selectedShop, setSelectedShop] = useState<TDomainsShopify>("toupies-beyblade.myshopify.com");

    return (
        <Tabs value={selectedShop} onValueChange={(value) => setSelectedShop(value as TDomainsShopify)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
                {boutiques.map((boutique) => {
                    const shop = boutique.domain;
                    return (
                        <TabsTrigger key={shop} value={shop} className="text-xs cursor-pointer">
                            {boutique.vendor}
                            <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline ml-2" />
                        </TabsTrigger>
                    );
                })}
            </TabsList>
        </Tabs>
    );
}
