import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import TasksAffiliation from "./ProductsTasks/TasksAffiliation";
import AddManually from "./Manually/AddManually";

export default async function Page() {
    const tasksAffiliation = await tasksAffiliationController.getAllPending();
    return (
        <div>
            <AddManually />
            <TasksAffiliation tasks={tasksAffiliation} />
        </div>
    );
}
