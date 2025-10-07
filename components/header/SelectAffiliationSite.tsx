"use client";

import useAffiliationStore from "@/app/create/storeTasksAffiliation";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { websites } from "@/library/params/paramsCreateAffiliation";

export default function SelectAffiliationSite() {
    const { websiteFilter, setWebsiteFilter } = useAffiliationStore();
    const option = websites.map((website) => ({
        label: website,
        value: website,
    }));

    const handleSelect = (website: string) => {
        setWebsiteFilter(website);
    };

    const handleEscape = () => {
        setWebsiteFilter("");
    };
    useKeyboardShortcuts("Escape", handleEscape);

    return <Selecteur array={option} value={websiteFilter} onChange={handleSelect} placeholder="Choisir l'origine" />;
}
