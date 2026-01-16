import { create } from "zustand";

interface StoreState {
    sku: string;
    setSku: (sku: string) => void;
    barcode: string;
    setBarcode: (barcode: string) => void;
    weight: number;
    setWeight: (weight: number) => void;
    weightUnit: string;
    setWeightUnit: (unit: string) => void;
}

const useVariantStore = create<StoreState>((set) => ({
    sku: "",
    setSku: (sku) => set({ sku }),
    barcode: "",
    setBarcode: (barcode) => set({ barcode }),
    weight: 0,
    setWeight: (weight) => set({ weight }),
    weightUnit: "GRAMS",
    setWeightUnit: (weightUnit) => set({ weightUnit }),
}));

export default useVariantStore;
