import Selecteur from "@/components/selecteur";
import { authOptions } from "@/library/auth/authOption";
import { getServerSession } from "next-auth";
import Action from "./Action";

export default async function Page() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <h3>Création de fiches produits</h3>
            <Action />
        </div>
    );
}
