"use client";

import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiqueFromDomain, boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import Image from "next/image";
import useOrdersStore from "../orders/store";
import useShopifyStore from "../shopify/shopifyStore";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product, setSearchTerm } = useShopifyStore();
    const { setFilterOrders, orders } = useOrdersStore();

    const option2 = boutiques.map((boutique) => ({
        label: (
            <>
                <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                {boutique.vendor}
            </>
        ),
        value: boutique.domain,
    }));

    const handleSelectOrigin = (domain: TDomainsShopify) => {
        const boutique = boutiqueFromDomain(domain);
        setShopifyBoutique(boutique);
        if (product) setProduct(null);
    };

    const handleEscape = () => {
        setShopifyBoutique(null);
        setFilterOrders(orders);
        setSearchTerm("");
    };
    useKeyboardShortcuts("Escape", handleEscape);

    return (
        <Selecteur
            array={option2}
            value={shopifyBoutique?.domain || ""}
            onChange={handleSelectOrigin}
            placeholder="Choisir l'origine"
        />
    );
}
