"use client";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { useEffect, useState } from "react";
import useAffiliationStore from "../storeTasksAffiliation";
import { AffiliationTaskProvider } from "./ContextTaskAffiliation";
import TaskAffiliation from "./TaskAffiliation";
import useShopifyStore from "@/components/shopify/shopifyStore";

export default function TasksAffiliation() {
    const { searchTerm } = useShopifyStore();
    const { tasksAffil, websiteFilter, setArrayTypesProducts, typesProducts, setTypesProducts } = useAffiliationStore();
    const [tasksFiltered, setTasksFiltered] = useState<TAffiliationTask[]>(tasksAffil);

    useEffect(() => {
        const searchLower = searchTerm.toLowerCase();

        const filtered = tasksAffil.filter((task) => {
            // Filtre par searchTerm
            const matchesSearch =
                !searchTerm || task.title.toLowerCase().includes(searchLower) || task.asin.toLowerCase().includes(searchLower);

            // Filtre par website
            const matchesWebsite = !websiteFilter || task.website === websiteFilter;

            // Filtre par productType
            const matchesType = !typesProducts || task.productType === typesProducts;

            return matchesSearch && matchesWebsite && matchesType;
        });

        setTasksFiltered(filtered);
    }, [websiteFilter, typesProducts, tasksAffil, searchTerm]);

    // Met à jour les types de produits disponibles
    useEffect(() => {
        if (!websiteFilter) {
            setArrayTypesProducts(
                Array.from(new Set(tasksAffil.map((task) => task.productType))).sort((a, b) => a.localeCompare(b))
            );
            return;
        }

        const uniqueTypes = Array.from(
            new Set(tasksFiltered.filter((task) => task.website === websiteFilter).map((task) => task.productType as string))
        );

        setArrayTypesProducts(uniqueTypes);

        // Reset le type sélectionné s'il n'existe plus dans les options
        if (typesProducts && !uniqueTypes.includes(typesProducts)) {
            setTypesProducts("");
        }
    }, [websiteFilter, tasksFiltered, typesProducts, setArrayTypesProducts, setTypesProducts]);

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
