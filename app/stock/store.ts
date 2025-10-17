import { TVariant } from "@/library/models/variantShopify/Variant";
import { create } from "zustand";

export const stockMode = ["later", "now", "bought"] as const;
export type TStockMode = (typeof stockMode)[number];

interface StoreState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    variants: TVariant[];
    setVariants: (variants: TVariant[]) => void;
    variantsFilter: TVariant[];
    setVariantsFilter: (variantsFilter: TVariant[]) => void;
    mode: TStockMode;
    setMode: (mode: TStockMode) => void;
}

const useVariantStore = create<StoreState>((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
    variants: [],
    setVariants: (variants) => set({ variants }),
    variantsFilter: [],
    setVariantsFilter: (variantsFilter) => set({ variantsFilter }),
    mode: "now",
    setMode: (mode) => set({ mode }),
}));

export default useVariantStore;
