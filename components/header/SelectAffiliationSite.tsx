"use client";

import useAffiliationStore from "@/app/tasks/storeTasksAffiliation";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { ar } from "date-fns/locale";

export default function SelectAffiliationSite() {
    const { tasksAffil, websiteFilter, setWebsiteFilter, arraySites } = useAffiliationStore();

    const option = arraySites.map((website) => ({
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

    return (
        <Selecteur
            array={option}
            value={arraySites.length === 1 ? arraySites[0] : websiteFilter}
            onChange={handleSelect}
            placeholder="Choisir l'origine"
        />
    );
}
