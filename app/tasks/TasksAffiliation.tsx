"use client";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import TaskAffiliation from "./task/TaskAffiliation";
import useAffiliationStore from "./storeTasksAffiliation";
import { useEffect } from "react";
import { AffiliationTaskProvider } from "./task/ContextTaskAffiliation";

export default function TasksAffiliation({ tasks }: { tasks: TAffiliationTask[] }) {
    const { setTasksAffil, tasksAffil } = useAffiliationStore();

    useEffect(() => {
        setTasksAffil(tasks);
    }, [tasks, setTasksAffil]);

    return (
        <div className="flex flex-wrap gap-4 p-4 items-center justify-center">
            <h2 className="w-full text-center text-2xl font-bold mb-4">
                Tâches d'affiliation ({tasksAffil.length} {tasksAffil.length > 1 ? "tâches" : "tâche"} en attente)
            </h2>
            <div className="flex flex-wrap gap-4">
                {tasksAffil.map((task) => (
                    <AffiliationTaskProvider key={task._id} task={task}>
                        <TaskAffiliation />
                    </AffiliationTaskProvider>
                ))}
            </div>
        </div>
    );
}
