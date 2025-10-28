import AddManually from "./Manually/AddManually";
import TasksAffiliation from "./ProductsTasks/TasksAffiliation";

export default async function Page() {
    return (
        <div>
            <AddManually />
            <TasksAffiliation />
        </div>
    );
}
