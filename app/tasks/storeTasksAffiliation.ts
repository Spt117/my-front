import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { create } from "zustand";

interface StoreState {
    tasksAffil: TAffiliationTask[];
    setTasksAffil: (tasks: TAffiliationTask[]) => void;
}

const useAffiliationStore = create<StoreState>((set) => ({
    tasksAffil: [],
    setTasksAffil: (tasks) => set({ tasksAffil: tasks }),
}));

export default useAffiliationStore;
