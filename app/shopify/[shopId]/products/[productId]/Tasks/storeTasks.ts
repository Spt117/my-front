import { TActivationType, TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { create } from "zustand";

interface StoreState {
    typeTask: TActivationType;
    setTypeTask: (type: TActivationType) => void;
    param: number;
    setParam: (param: number) => void;
    tasks: TTaskShopifyProducts[];
    setTasks: (tasks: TTaskShopifyProducts[]) => void;
}

const useTaskStore = create<StoreState>((set) => ({
    typeTask: "timestamp",
    setTypeTask: (type) => set({ typeTask: type }),
    param: 0,
    setParam: (param) => set({ param }),
    tasks: [],
    setTasks: (tasks) => set({ tasks }),
}));

export default useTaskStore;
