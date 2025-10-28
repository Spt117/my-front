import { tasksAffiliationController } from "@/library/models/tasksAffiliation/tasksAffiliationController";
import LayoutClient from "./LayoutClient";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const tasksAffiliation = await tasksAffiliationController.getAllPending();

    return <LayoutClient tasks={tasksAffiliation}>{children}</LayoutClient>;
}
