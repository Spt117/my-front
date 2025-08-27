"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MultiSelect, MultiSelectOption } from "./Multiselect";
import Product from "../[shopify]/Product";

export default function Action() {
    const { shopifyBoutique, loading, setLoading, setProduct, product } = useShopifyStore();
    const [domainsDest, setDomainsDest] = useState<TDomainsShopify[]>([]);

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
        setDomainsDest(selectedOptions as TDomainsShopify[]);
    };

    const handleValidate = async () => {
        setLoading(true);
        const uri = "http://localhost:9100/shopify/duplicate";
        if (!shopifyBoutique || !product) return;
        const data = {
            domainsDest: domainsDest,
            productId: product.id,
            tags: product.tags,
            domainOrigin: shopifyBoutique.domain,
        };
        const res = await postServer(uri, data);
        console.log(res);
        setLoading(false);
    };

    return (
        <>
            <MultiSelect placeholder={"Choisir les boutiques"} options={options} onValueChange={handleSelectDest} />
            {!loading && shopifyBoutique && product && domainsDest.length > 0 && <Button onClick={handleValidate}>Lancer la duplication</Button>}
            {loading && <Spinner />}
            {product && <Product data={product} boutique={shopifyBoutique!} />}
        </>
    );
}
