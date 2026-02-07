"use client";
import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import useAffiliationStore from "../storeTasksAffiliation";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { AffiliationTaskProvider } from "./ContextTaskAffiliation";
import TaskAffiliation from "./TaskAffiliation";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-100">
                    File d&apos;affiliation
                </h1>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {tasksFiltered.length} {tasksFiltered.length > 1 ? "produits" : "produit"}
                </span>
            </div>

            {tasksFiltered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Inbox className="w-16 h-16 mb-4 text-gray-600" />
                    <p className="text-lg font-medium text-gray-400">Aucune tâche trouvée</p>
                    <p className="text-sm text-gray-500 mt-1">Modifiez vos filtres ou ajoutez de nouvelles tâches</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tasksFiltered.map((task) => (
                        <AffiliationTaskProvider key={task._id} task={task}>
                            <TaskAffiliation />
                        </AffiliationTaskProvider>
                    ))}
                </div>
            )}
        </div>
    );
}
