"use client";

import Selecteur from "@/components/selecteur";
import { boutiques } from "@/library/params/paramsShopify";
import Image from "next/image";
import useShopifyStore from "../shopify/shopifyStore";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product } = useShopifyStore();

    const option2 = boutiques.map((boutique) => ({
        label: (
            <>
                <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                {boutique.vendor}
            </>
        ),
        value: boutique.domain,
    }));

    const handleSelectOrigin = (selectedOption: string) => {
        const boutique = boutiques.find((b) => b.domain === selectedOption) || null;
        setShopifyBoutique(boutique);
        if (product) setProduct(null);
    };

    return <Selecteur array={option2} value={shopifyBoutique?.domain || ""} onChange={handleSelectOrigin} placeholder="Choisir l'origine" />;
}
