"use client";

import useAffiliationStore from "@/app/create/storeTasksAffiliation";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import {
    boutiqueFromDomain,
    boutiqueFromPublicDomain,
    TDomainsShopify,
    TPublicDomainsShopify,
} from "@/library/params/paramsShopify";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SelectAffiliationSite() {
    const { websiteFilter, setWebsiteFilter, setTypesProducts, typesProducts, arrayTypesProducts, arraySites } =
        useAffiliationStore();
    const param = useSearchParams();
    const router = useRouter();

    const optionWebsite = arraySites.map((website) => ({
        label: website,
        value: website,
    }));

    const optionTypesProducts = arrayTypesProducts.map((type) => ({
        label: type,
        value: type,
    }));

    const handleEscape = () => {
        setWebsiteFilter("");
        setTypesProducts("");
    };
    useKeyboardShortcuts("Escape", handleEscape);

    useEffect(() => {
        const domain = param.get("domain") as TDomainsShopify;
        if (domain && typeof domain === "string") {
            const boutique = boutiqueFromDomain(domain);
            setWebsiteFilter(boutique.publicDomain);
        }
    }, [param, setWebsiteFilter]);

    const handleChangeWebsite = (value: string) => {
        const boutique = boutiqueFromPublicDomain(value as TPublicDomainsShopify);
        router.push(`/create?domain=${boutique.domain}`);
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
        </>
    );
}
