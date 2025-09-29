"use client";

import useVariantStore, { stockMode, TStockMode } from "@/app/stock/store";
import Selecteur from "@/components/selecteur";

export default function ShopifySelect() {
    const { mode, setMode } = useVariantStore();

    const options = stockMode.map((mode) => ({
        label: mode === "now" ? "A acheter" : mode === "later" ? "A acheter plus tard" : "Déjà acheté",
        value: mode,
    }));
    const handleSelectOrigin = (mode: TStockMode) => {
        setMode(mode);
    };

    return <Selecteur array={options} value={mode} onChange={handleSelectOrigin} placeholder="Choisir l'origine" />;
}
