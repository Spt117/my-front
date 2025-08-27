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

interface IDuplicatePostRequest {
    productId: string;
    domainsDest: TDomainsShopify[];
    tags: string[];
}

export default function Action() {
    const { shopifyBoutique, loading, setLoading, setProduct, product } = useShopifyStore();
    const [params, setParams] = useState<IDuplicatePostRequest>({
        productId: "",
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
        setParams((prev) => ({
            ...prev,
            productId: e.target.value,
        }));
    };

    const handleValidate = async () => {
        setLoading(true);
        const uri = "http://localhost:9100/shopify/duplicate";
        const data = {
            ...params,
            domainOrigin: shopifyBoutique?.domain,
        };
        const res = await postServer(uri, data);
        setLoading(false);
    };

    useEffect(() => {
        const getProduct = async () => {
            const uri = "http://localhost:9100/shopify/product-by-id";
            const res = await postServer(uri, { domain: shopifyBoutique?.domain, productId: params.productId });
            setProduct(res.response);
        };
        if (params.productId && shopifyBoutique) getProduct();
    }, [params.productId]);

    return (
        <>
            <MultiSelect placeholder={"Choisir les boutiques"} options={options} onValueChange={handleSelectDest} />
            <Input type="string" onChange={handleSelectId} placeholder="Id produit" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
            {!loading && shopifyBoutique && params.domainsDest.length > 0 && params.productId && <Button onClick={handleValidate}>Lancer la duplication</Button>}
            {loading && <Spinner />}
            {product && <Product data={product} boutique={shopifyBoutique!} />}
        </>
    );
}
