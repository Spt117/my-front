import { veilleController } from "@/library/models/veille/veilleController";
import VeilleCollections from "./VeilleCollections";
import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import TasksAffiliation from "./TasksAffiliation";

export default async function Page() {
    const data = await veilleController().getVeillesByUser();
    const hasntCollections = data.filter((c) => !c.website || c.website.length === 0);

    const tasksAffiliation = await tasksAffiliationController.getAllPending();
    return (
        <div>
            <VeilleCollections collections={hasntCollections} />
            <TasksAffiliation tasks={tasksAffiliation} />
        </div>
    );
}
