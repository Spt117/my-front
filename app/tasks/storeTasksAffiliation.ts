import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { create } from "zustand";

interface StoreState {
    tasksAffil: TAffiliationTask[];
    setTasksAffil: (tasks: TAffiliationTask[]) => void;
    arraySites: string[];
    setArraySites: (sites: string[]) => void;
    websiteFilter: string;
    setWebsiteFilter: (website: string) => void;
}

const useAffiliationStore = create<StoreState>((set) => ({
    tasksAffil: [],
    setTasksAffil: (tasks) => set({ tasksAffil: tasks }),
    websiteFilter: "",
    setWebsiteFilter: (website) => set({ websiteFilter: website }),
    arraySites: [],
    setArraySites: (sites) => set({ arraySites: sites }),
}));

export default useAffiliationStore;
