"use client";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import TaskAffiliation from "./TaskAffiliation";
import useAffiliationStore from "../storeTasksAffiliation";
import { useEffect } from "react";
import { AffiliationTaskProvider } from "./ContextTaskAffiliation";

export default function TasksAffiliation({ tasks }: { tasks: TAffiliationTask[] }) {
    const { setTasksAffil, tasksAffil, setArraySites, websiteFilter } = useAffiliationStore();

    useEffect(() => {
        setArraySites(Array.from(new Set(tasks.map((task) => task.website))).sort((a, b) => a.localeCompare(b)));
        setTasksAffil(tasks);
    }, [tasks, setTasksAffil]);

    const tasksFiltered = websiteFilter ? tasksAffil.filter((task) => task.website === websiteFilter) : tasksAffil;

    return (
        <div className="flex flex-wrap gap-4 p-4 items-center justify-center">
            <h2 className="w-full text-center text-2xl font-bold mb-4">
                {tasksAffil.length} {tasksAffil.length > 1 ? "produits" : "produit"} en attente
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
