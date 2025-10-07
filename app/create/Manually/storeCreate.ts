import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { TBeybladeProducts, TNiche, TPokemonProducts } from "@/library/params/paramsCreateAffiliation";
import { create } from "zustand";

interface StoreState {
    selectedNiche: TNiche | null;
    setSelectedNiche: (niche: TNiche | null) => void;
    selectedProduct: TPokemonProducts | TBeybladeProducts | null;
    setSelectedProduct: (product: TPokemonProducts | TBeybladeProducts | null) => void;
}

const useCreateStore = create<StoreState>((set) => ({
    selectedNiche: null,
    setSelectedNiche: (niche) => set({ selectedNiche: niche }),
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),
}));

export default useCreateStore;
