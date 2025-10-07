import { TBeybladeProducts, TNiche, TPokemonProducts } from "@/library/params/paramsCreateAffiliation";
import { create } from "zustand";

interface StoreState {
    selectedNiche: TNiche | null;
    setSelectedNiche: (niche: TNiche | null) => void;
    selectedProduct: TPokemonProducts | TBeybladeProducts | null;
    setSelectedProduct: (product: TPokemonProducts | TBeybladeProducts | null) => void;

    // For data products
    size: number | null;
    setSize: (size: number | null) => void;
    namePokemon: string;
    setNamePokemon: (name: string) => void;
}

const useCreateStore = create<StoreState>((set) => ({
    selectedNiche: null,
    setSelectedNiche: (niche) => set({ selectedNiche: niche }),
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),

    // For data products
    size: null,
    setSize: (size) => set({ size }),
    namePokemon: "",
    setNamePokemon: (name) => set({ namePokemon: name }),
}));

export default useCreateStore;
