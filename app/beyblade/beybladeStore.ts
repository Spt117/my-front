import { IBeybladeProduct, IProductContentItem, TBeybladeGeneration } from "@/app/beyblade/model/typesBeyblade";
import { create } from "zustand";

interface StoreState {
    generation: TBeybladeGeneration;
    setGeneration: (generation: TBeybladeGeneration) => void;

    beybladeProduct: Partial<IBeybladeProduct> | null;

    // Setters génériques
    setBeybladeProduct: (product: Partial<IBeybladeProduct> | null) => void;
    updateProduct: <K extends keyof IBeybladeProduct>(key: K, value: IBeybladeProduct[K]) => void;

    // Gestion des tableaux
    addImage: (imageUrl: string) => void;
    removeImage: (index: number) => void;
    addContentItem: (item: IProductContentItem) => void;
    removeContentItem: (index: number) => void;

    // Actions globales
    resetBeybladeProduct: () => void;
    initializeNewProduct: () => void;
}

const useBeybladeStore = create<StoreState>((set) => ({
    generation: "X",
    setGeneration: (generation) => set({ generation }),
    beybladeProduct: null,

    setBeybladeProduct: (product) => set({ beybladeProduct: product }),

    // Setter générique pour toutes les propriétés
    updateProduct: (key, value) =>
        set((state) => ({
            beybladeProduct: { ...state.beybladeProduct, [key]: value },
        })),

    // Gestion des images
    addImage: (imageUrl) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                images: [...(state.beybladeProduct?.images || []), imageUrl],
            },
        })),
    removeImage: (index) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                images: state.beybladeProduct?.images?.filter((_, i) => i !== index) || [],
            },
        })),

    // Gestion des items de contenu
    addContentItem: (item) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                content: [...(state.beybladeProduct?.content || []), item],
            },
        })),
    removeContentItem: (index) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                content: state.beybladeProduct?.content?.filter((_, i) => i !== index) || [],
            },
        })),

    // Actions globales
    resetBeybladeProduct: () => set({ beybladeProduct: null }),

    initializeNewProduct: () =>
        set({
            beybladeProduct: {
                images: [],
            },
        }),
}));

export default useBeybladeStore;
