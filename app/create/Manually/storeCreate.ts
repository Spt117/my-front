import { TBeybladeProducts, TNiche, TPokemonProducts } from "@/params/paramsCreateAffiliation";
import { create } from "zustand";

interface PayloadPeluche {
    namePokemon: string;
    size: number;
}

interface StoreState {
    selectedNiche: TNiche | null;
    setSelectedNiche: (niche: TNiche | null) => void;
    selectedProduct: TPokemonProducts | TBeybladeProducts | null;
    setSelectedProduct: (product: TPokemonProducts | TBeybladeProducts | null) => void;

    asin: string;
    setAsin: (asin: string) => void;
    // For data products
    payloadPeluche: Partial<PayloadPeluche>;
    updatePayloadPeluche: (key: keyof PayloadPeluche, value: string | number) => void;
}

const useCreateStore = create<StoreState>((set) => ({
    selectedNiche: null,
    setSelectedNiche: (niche) => set({ selectedNiche: niche }),
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),

    asin: "",
    setAsin: (asin) => set({ asin }),

    // For data products
    payloadPeluche: {},
    updatePayloadPeluche: (key, value) =>
        set((state) => ({
            payloadPeluche: {
                ...state.payloadPeluche,
                [key]: value,
            },
        })),
}));

export default useCreateStore;
