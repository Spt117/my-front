"use client";

import useAffiliationStore from "@/app/create/storeTasksAffiliation";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiqueFromPublicDomain, boutiques, TPublicDomainsShopify } from "@/params/paramsShopify";
import { useEffect } from "react";

export default function SelectAffiliationSite() {
    const { websiteFilter, setWebsiteFilter, setTypesProducts, typesProducts, arrayTypesProducts, arraySites } =
        useAffiliationStore();
    const { shopifyBoutique, setShopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();

    const optionWebsite = boutiques.map((website) => ({
        label: website.publicDomain,
        value: website.publicDomain,
    }));

    const optionTypesProducts = arrayTypesProducts.map((type) => ({
        label: type,
        value: type,
    }));

    const handleEscape = () => {
        setWebsiteFilter("");
        setTypesProducts("");
        setShopifyBoutique(null);
    };
    useKeyboardShortcuts("Escape", handleEscape);

    useEffect(() => {
        if (shopifyBoutique) setWebsiteFilter(shopifyBoutique.publicDomain);
    }, [shopifyBoutique]);

    const handleChangeWebsite = (value: string) => {
        const boutique = boutiqueFromPublicDomain(value as TPublicDomainsShopify);
        setShopifyBoutique(boutique);
    };

    return (
        <>
            <Selecteur
                array={optionWebsite}
                value={websiteFilter}
                onChange={handleChangeWebsite}
                placeholder="Choisir l'origine"
            />
            <Selecteur
                array={optionTypesProducts}
                value={typesProducts}
                onChange={setTypesProducts}
                placeholder="Choisir le type de produit"
            />
            <Input
                className="flex-1"
                placeholder="Rechercher un produit"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </>
    );
}
