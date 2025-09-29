"use client";

import useVariantStore, { stockMode, TStockMode } from "@/app/stock/store";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";

export default function ShopifySelect() {
    const { mode, setMode } = useVariantStore();
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

    return <Selecteur array={options} value={mode} onChange={handleSelectOrigin} placeholder="Choisir l'origine" />;
}
