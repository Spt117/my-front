import ErrorPage from "@/components/layout/ErrorPage";
import { veilleController } from "@/library/models/veille/veilleController";
import VeilleCollections from "./VeilleCollections";

export default async function Page() {
    try {
        const data = await veilleController().getVeillesByUser();
        return (
            <div>
                <VeilleCollections collections={data} />
            </div>
        );
    } catch (e) {
        console.error("Erreur chargement veilles:", e);
        return <ErrorPage message="Impossible de charger les tâches de veille. Vérifiez la connexion au serveur." />;
    }
}
