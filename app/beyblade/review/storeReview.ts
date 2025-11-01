import { IBeybladeProduct } from "@/app/beyblade/model/typesBeyblade";
import { create } from "zustand";

interface StoreState {
    reviewItems: IBeybladeProduct[];
    setReviewItems: (items: IBeybladeProduct[]) => void;
}

const useReviewStore = create<StoreState>((set) => ({
    reviewItems: [],
    setReviewItems: (items) => set({ reviewItems: items }),
}));

export default useReviewStore;
