import ErrorPage from "@/components/layout/ErrorPage";
import { listProspects } from "./actions";
import ColissimoProspects from "./ColissimoProspects";

export default async function Page() {
    try {
        const prospects = await listProspects();
        return <ColissimoProspects initialProspects={prospects} />;
    } catch (e) {
        console.error("Erreur chargement prospects Colissimo:", e);
        return <ErrorPage message="Impossible de charger les prospects Colissimo. Vérifiez la connexion au serveur." />;
    }
}
