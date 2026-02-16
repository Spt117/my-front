import { TaskDetails } from "@/app/create/[id]/TaskDetails";
import ErrorPage from "@/components/layout/ErrorPage";
import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import { SegmentParams } from "@/library/types/utils";

interface props {
    params: Promise<SegmentParams>;
}

export default async function Page({ params }: props) {
    const { id } = await params;

    let task;
    try {
        task = await tasksAffiliationController.getTaskById(id);
    } catch (e) {
        console.error("Erreur chargement tâche:", e);
        return <ErrorPage message="Impossible de charger la tâche. Vérifiez la connexion au serveur." />;
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Tâche introuvable</h1>
                    <p className="text-muted-foreground">La tâche avec l&apos;ID {id} n&apos;existe pas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-4">
            <TaskDetails task={task} />
        </div>
    );
}
