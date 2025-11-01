import { IArena, IBeyblade, IBeybladeProduct, ILauncher, TBeybladeProductType } from "@/app/beyblade/model/typesBeyblade";
import { TBrandBeyblade } from "@/params/paramsCreateAffiliation";
import { create } from "zustand";

interface StoreState {
    beybladeProduct: Partial<IBeybladeProduct> | null;

    // Setters génériques
    setBeybladeProduct: (product: Partial<IBeybladeProduct> | null) => void;
    updateProduct: <K extends keyof IBeybladeProduct>(key: K, value: IBeybladeProduct[K]) => void;

    // Gestion des tableaux
    addImage: (imageUrl: string) => void;
    removeImage: (index: number) => void;
    addContent: (item: IBeyblade | ILauncher | IArena) => void;
    removeContent: (index: number) => void;
    updateContent: (index: number, item: IBeyblade | ILauncher | IArena) => void;

    // Actions globales
    resetBeybladeProduct: () => void;
    initializeNewProduct: () => void;
}

const useBeybladeStore = create<StoreState>((set) => ({
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

    // Gestion du contenu (Beyblade, Launcher, Arena)
    addContent: (item) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                content: [...(state.beybladeProduct?.content || []), item],
            },
        })),

    removeContent: (index) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                content: state.beybladeProduct?.content?.filter((_, i) => i !== index) || [],
            },
        })),

    updateContent: (index, item) =>
        set((state) => ({
            beybladeProduct: {
                ...state.beybladeProduct,
                content: state.beybladeProduct?.content?.map((c, i) => (i === index ? item : c)) || [],
            },
        })),

    // Actions globales
    resetBeybladeProduct: () => set({ beybladeProduct: null }),

    initializeNewProduct: () =>
        set({
            beybladeProduct: {
                images: [],
                content: [],
            },
        }),
}));

export default useBeybladeStore;
