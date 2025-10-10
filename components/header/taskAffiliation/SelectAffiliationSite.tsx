"use client";

import useAffiliationStore from "@/app/create/storeTasksAffiliation";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";

export default function SelectAffiliationSite() {
    const { websiteFilter, setWebsiteFilter, setTypesProducts, typesProducts, arrayTypesProducts, arraySites } =
        useAffiliationStore();
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

    return (
        <>
            <Selecteur array={optionWebsite} value={websiteFilter} onChange={setWebsiteFilter} placeholder="Choisir l'origine" />
            <Selecteur
                array={optionTypesProducts}
                value={typesProducts}
                onChange={setTypesProducts}
                placeholder="Choisir le type de produit"
            />
        </>
    );
}
