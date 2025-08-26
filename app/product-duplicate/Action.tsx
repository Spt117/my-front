"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import Image from "next/image";
import { useState } from "react";
import { MultiSelect, MultiSelectOption } from "./Multiselect";
import ShopifySelect from "@/components/ShopifySelect";
import useShopifyStore from "@/components/shopify/shopifyStore";

interface IDuplicatePostRequest {
    productId: number;
    domainsDest: TDomainsShopify[];
    tags: string[];
}

export default function Action() {
    const { shopifyBoutique } = useShopifyStore();
    const [params, setParams] = useState<IDuplicatePostRequest>({
        productId: 0,
        domainsDest: [],
        tags: [],
    });

    const options = boutiques.map((boutique) => ({
        label: (
            <>
                <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                {boutique.vendor}
            </>
        ),
        value: boutique.domain,
    })) as unknown as MultiSelectOption[];

    const handleSelectDest = (selectedOptions: string[]) => {
        setParams((prev) => ({
            ...prev,
            domainsDest: selectedOptions as TDomainsShopify[],
        }));
    };

    const handleSelectId = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setParams((prev) => ({
            ...prev,
            productId: value,
        }));
    };

    const handleValidate = async () => {
        const uri = "http://localhost:9100/shopify/duplicate";
        const res = await postServer(uri, params);
        console.log(res);
    };

    return (
        <>
            <ShopifySelect />
            <MultiSelect placeholder={"Choisir les boutiques"} options={options} onValueChange={handleSelectDest} />
            <Input type="number" onChange={handleSelectId} placeholder="Id produit" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
            {shopifyBoutique && params.domainsDest.length > 0 && params.productId > 0 && <Button onClick={handleValidate}>Lancer la duplication</Button>}
        </>
    );
}
