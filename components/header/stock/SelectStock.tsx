"use client";

import useVariantStore, { stockMode, TStockMode } from "@/app/stock/store";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { RefreshCcw } from "lucide-react";

export default function SlectStock() {
    const { mode, setMode, loading } = useVariantStore();
    const { setSearchTerm } = useShopifyStore();

    const options = stockMode.map((mode) => ({
        label: mode === "now" ? "A acheter" : mode === "later" ? "A acheter plus tard" : "Déjà acheté",
        value: mode,
    }));

    const handleSelectOrigin = (mode: TStockMode) => {
        setMode(mode);
    };

    const handleEscape = () => {
        setSearchTerm("");
        setMode("now");
    };
    useKeyboardShortcuts("Escape", handleEscape);

    return (
        <>
            {loading && <RefreshCcw size={20} className={`transition-transform duration-300 ease-in-out animate-spin`} />}
            <Selecteur array={options} value={mode} onChange={handleSelectOrigin} placeholder="Choisir l'origine" />
        </>
    );
}
