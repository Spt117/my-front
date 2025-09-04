"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import Image from "next/image";
import { useState } from "react";
import Product from "../[shopify]/Product";
import { MultiSelect, MultiSelectOption } from "./Multiselect";
import { ProductType } from "@/components/shopify/ProductType";

export default function Action() {
    const { shopifyBoutique, product, selectedType, selectedBrand } = useShopifyStore();
    const [domainsDest, setDomainsDest] = useState<TDomainsShopify[]>([]);
    const [loading, setLoading] = useState(false);

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
        if (!shopifyBoutique || !product || !selectedType || !selectedBrand) {
            console.log("Missing required fields");
            return;
        }
        const data = {
            domainsDest: domainsDest,
            productId: product.id,
            tags: product.tags,
            domainOrigin: shopifyBoutique.domain,
            productType: selectedType,
            productBrand: selectedBrand,
        };
        const res = await postServer(uri, data);
        console.log(res);
        setLoading(false);
    };

    return (
        <>
            <MultiSelect placeholder={"Choisir les boutiques"} options={options} onValueChange={handleSelectDest} />
            <ProductType />
            {!loading && shopifyBoutique && product && domainsDest.length > 0 && <Button onClick={handleValidate}>Lancer la duplication</Button>}
            {loading && (
                <div className="flex justify-center">
                    <Spinner size={35} />
                </div>
            )}
            {product && <Product data={product} boutique={shopifyBoutique!} />}
        </>
    );
}
