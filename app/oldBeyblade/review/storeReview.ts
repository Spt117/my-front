import { IBeybladeProduct } from '@/app/oldBeyblade/model/typesBeyblade';
import { create } from 'zustand';

interface StoreState {
    reviewItems: IBeybladeProduct[];
    setReviewItems: (items: IBeybladeProduct[]) => void;
    item: IBeybladeProduct | null;
    setItem: (item: IBeybladeProduct | null) => void;
}

const useReviewStore = create<StoreState>((set) => ({
    reviewItems: [],
    setReviewItems: (items) => set({ reviewItems: items }),
    item: null,
    setItem: (item) => set({ item }),
}));

export default useReviewStore;
