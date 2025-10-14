"use client";

import { ProductType } from "@/components/shopify/ProductType";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { sleep } from "@/library/utils/helpers";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { MultiSelect, MultiSelectOption } from "./Multiselect";

export default function Action() {
    const { shopifyBoutique, product, selectedType, selectedBrand } = useShopifyStore();

    const [domainsDest, setDomainsDest] = useState<TDomainsShopify[]>([]);
    const [loading, setLoading] = useState(false);

    const options = boutiques
        .filter((b) => b.domain !== shopifyBoutique?.domain)
        .map((boutique) => ({
            label: (
                <>
                    <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                    {boutique.vendor}
                </>
            ),
            value: boutique.domain,
            disabled: boutique.domain === shopifyBoutique?.domain,
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
        interface IResponseDuplicate {
            response: { messages?: string[]; errors?: string[] } | null;
            error?: string;
            message?: string;
        }
        const res = (await postServer(uri, data)) as IResponseDuplicate;
        console.log(res);
        if (res.error) toast.error(res.error);
        if (res.message) toast.success(res.message);
        await sleep(2000);
        if (res.response?.messages && res.response.messages.length > 0) {
            for (const message of res.response.messages) {
                toast.success(message);
                await sleep(2000);
            }
        }
        if (res.response?.errors && res.response.errors.length > 0) {
            for (const error of res.response.errors) {
                toast.error(error);
                await sleep(2000);
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <MultiSelect className="z-80" placeholder={"Choisir les boutiques"} options={options} onValueChange={handleSelectDest} />
            <ProductType />
            <div className="flex gap-4 my-4">
                <Button disabled={loading || !selectedBrand || !selectedType} onClick={handleValidate}>
                    Lancer la duplication
                </Button>
            </div>
        </div>
    );
}
