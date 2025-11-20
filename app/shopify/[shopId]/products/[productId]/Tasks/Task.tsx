import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { deleteTaskShopify } from "@/library/models/tasksShopify/taskMiddleware";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { sleep } from "@/library/utils/helpers";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Task({ task, index }: { task: TTaskShopifyProducts; index: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const data =
        task.activation === "timestamp"
            ? `le ${new Date(task.timestampActivation).toLocaleString()}`
            : `quantité restante à ${task.stockActivation}`;

    const handleDelete = async () => {
        setLoading(true);
        if (!task._id) {
            toast.error("Impossible de supprimer cette tâche car elle n'a pas d'ID.");
            setLoading(false);
            return;
        }
        try {
            const res = await deleteTaskShopify(task._id);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
            router.refresh();
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-2 flex gap-2 w-full " key={index}>
            <span>{index ? "ou" : "Fin"} </span>
            <div className="relative inline-block group w-full">
                <Badge className="bg-blue-100 text-blue-700 w-full transition-all duration-200 group-hover:shadow-md group-hover:bg-blue-200">
                    {data}
                    <button
                        title="Supprimer le tag"
                        onClick={handleDelete}
                        className="cursor-pointer absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <Spinner className={`absolute right-[-16px] w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                </Badge>
            </div>
        </div>
    );
}
