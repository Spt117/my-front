import { TActivationType } from "@/library/models/tasksShopify/taskType";
import { create } from "zustand";

interface StoreState {
    typeTask: TActivationType;
    setTypeTask: (type: TActivationType) => void;
}

const useTaskStore = create<StoreState>((set) => ({
    typeTask: "timestamp",
    setTypeTask: (type) => set({ typeTask: type }),
}));

export default useTaskStore;
