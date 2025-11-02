import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { TDomainsShopify, TPublicDomainsShopify } from "@/params/paramsShopify";
import { create } from "zustand";

interface StoreState {
    tasksAffil: TAffiliationTask[];
    setTasksAffil: (tasks: TAffiliationTask[]) => void;
    arraySites: string[];
    setArraySites: (sites: string[]) => void;
    websiteFilter: TPublicDomainsShopify | "";
    setWebsiteFilter: (website: TPublicDomainsShopify | "") => void;
    typesProducts: string;
    setTypesProducts: (type: string) => void;
    arrayTypesProducts: string[];
    setArrayTypesProducts: (types: string[]) => void;
}

const useAffiliationStore = create<StoreState>((set) => ({
    tasksAffil: [],
    setTasksAffil: (tasks) => set({ tasksAffil: tasks }),
    websiteFilter: "",
    setWebsiteFilter: (website) => set({ websiteFilter: website }),
    arraySites: [],
    setArraySites: (sites) => set({ arraySites: sites }),
    typesProducts: "",
    setTypesProducts: (type) => set({ typesProducts: type }),
    arrayTypesProducts: [],
    setArrayTypesProducts: (types) => set({ arrayTypesProducts: types }),
}));

export default useAffiliationStore;
