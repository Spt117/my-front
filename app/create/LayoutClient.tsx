"use client";
import { useEffect } from "react";
import useAffiliationStore from "./storeTasksAffiliation";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";

interface ShopLayoutProps {
    children: React.ReactNode;
    tasks: TAffiliationTask[];
}

export default function LayoutClient({ children, tasks }: ShopLayoutProps) {
    const { setTasksAffil, setArraySites, setArrayTypesProducts, arrayTypesProducts } = useAffiliationStore();

    useEffect(() => {
        setTasksAffil(tasks);
        setArraySites(Array.from(new Set(tasks.map((task) => task.website))).sort((a, b) => a.localeCompare(b)));
        setArrayTypesProducts(Array.from(new Set(tasks.map((task) => task.productType))).sort((a, b) => a.localeCompare(b)));
    }, [tasks, setTasksAffil, setArraySites, setArrayTypesProducts]);

    useEffect(() => {
        console.log(arrayTypesProducts);
    }, [arrayTypesProducts, setArrayTypesProducts]);

    return <>{children}</>;
}
