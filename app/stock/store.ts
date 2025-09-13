import { TVariant } from "@/library/models/produits/Variant";
import { create } from "zustand";

interface StoreState {
    variantsBuy: TVariant[];
    setVariantsBuy: (variantsBuy: TVariant[]) => void;
    variantsBuyLater: TVariant[];
    setVariantsBuyLater: (variantsBuyLater: TVariant[]) => void;
    mode: "later" | "now";
    setMode: (mode: "later" | "now") => void;
}

const useVariantStore = create<StoreState>((set) => ({
    variantsBuy: [],
    setVariantsBuy: (variantsBuy) => set({ variantsBuy }),
    variantsBuyLater: [],
    setVariantsBuyLater: (variantsBuyLater) => set({ variantsBuyLater }),
    mode: "now",
    setMode: (mode) => set({ mode }),
}));

export default useVariantStore;
