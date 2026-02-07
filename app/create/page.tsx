import TasksAffiliation from "./ProductsTasks/TasksAffiliation";

export default async function Page() {
    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <TasksAffiliation />
            </div>
        </div>
    );
}
