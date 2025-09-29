import { TVariant } from "@/library/models/produits/Variant";
import { create } from "zustand";

export const stockMode = ["later", "now", "bought"] as const;
export type TStockMode = (typeof stockMode)[number];

interface StoreState {
    variants: TVariant[];
    setVariants: (variants: TVariant[]) => void;
    variantsFilter: TVariant[];
    setVariantsFilter: (variantsFilter: TVariant[]) => void;
    mode: TStockMode;
    setMode: (mode: TStockMode) => void;
}

const useVariantStore = create<StoreState>((set) => ({
    variants: [],
    setVariants: (variants) => set({ variants }),
    variantsFilter: [],
    setVariantsFilter: (variantsFilter) => set({ variantsFilter }),
    mode: "now",
    setMode: (mode) => set({ mode }),
}));

export default useVariantStore;
