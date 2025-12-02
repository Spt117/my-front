import { TaskDetails } from '@/components/TaskDetails';
import { tasksAffiliationController } from '@/library/models/tasksAffiliation/tasksAffiliationController';
import { SegmentParams } from '@/library/types/utils';

interface props {
    params: Promise<SegmentParams>;
}

export default async function Page({ params }: props) {
    const { id } = await params;

    const task = await tasksAffiliationController.getTaskById(id);

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Tâche introuvable</h1>
                    <p className="text-muted-foreground">La tâche avec l'ID {id} n'existe pas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <TaskDetails task={task} />
        </div>
    );
}
