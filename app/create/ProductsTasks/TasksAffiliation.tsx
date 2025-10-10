"use client";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAffiliationStore from "../storeTasksAffiliation";
import { AffiliationTaskProvider } from "./ContextTaskAffiliation";
import TaskAffiliation from "./TaskAffiliation";

export default function TasksAffiliation({ tasks }: { tasks: TAffiliationTask[] }) {
    const { setTasksAffil, tasksAffil, setArraySites, websiteFilter, setArrayTypesProducts, typesProducts } =
        useAffiliationStore();
    const [tasksFiltered, setTasksFiltered] = useState<TAffiliationTask[]>(tasksAffil);

    const router = useRouter();
    useEventListener("products/update", () => {
        router.refresh();
    });

    useEffect(() => {
        setArraySites(Array.from(new Set(tasks.map((task) => task.website))).sort((a, b) => a.localeCompare(b)));
        setTasksAffil(tasks);
        setArrayTypesProducts(Array.from(new Set(tasks.map((task) => task.productType))).sort((a, b) => a.localeCompare(b)));
    }, [tasks, setTasksAffil, setArraySites, setArrayTypesProducts]);

    useEffect(() => {
        setArrayTypesProducts(
            Array.from(new Set(tasksFiltered.map((task) => task.productType))).sort((a, b) => a.localeCompare(b))
        );
    }, [tasksFiltered, setArrayTypesProducts]);

    useEffect(() => {
        if (!websiteFilter && !typesProducts) return setTasksFiltered(tasksAffil);
        const tasksFilter = tasksAffil.filter((task) => {
            if (websiteFilter && typesProducts) return task.website === websiteFilter && task.productType === typesProducts;
            else if (websiteFilter) return task.website === websiteFilter;
        });
        setTasksFiltered(tasksFilter);
    }, [websiteFilter, typesProducts, tasksAffil]);

    return (
        <div className="flex flex-wrap gap-4 p-4 items-center justify-center">
            <h2 className="w-full text-center text-2xl font-bold mb-4">
                {tasksFiltered.length} {tasksFiltered.length > 1 ? "produits" : "produit"} en attente
            </h2>
            <div className="flex flex-wrap gap-4">
                {tasksFiltered.map((task) => (
                    <AffiliationTaskProvider key={task._id} task={task}>
                        <TaskAffiliation />
                    </AffiliationTaskProvider>
                ))}
            </div>
        </div>
    );
}
