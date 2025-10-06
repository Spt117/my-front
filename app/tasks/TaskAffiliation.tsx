import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";

export default async function TaskAffiliation({ task }: { task: TAffiliationTask }) {
    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h3>Task ID: {task._id}</h3>
            <p>Status: {task.status}</p>
        </div>
    );
}
