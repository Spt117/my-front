import ErrorPage from "@/components/layout/ErrorPage";
import { getKeepaSettings, listKeepaWatches } from "./serverAction";
import KeepaPage from "./KeepaPage";

export default async function Page() {
    try {
        const [watches, settings] = await Promise.all([listKeepaWatches(), getKeepaSettings()]);
        return <KeepaPage initialWatches={watches} initialSettings={settings} />;
    } catch (e) {
        console.error("Erreur chargement page Keepa:", e);
        return <ErrorPage message="Impossible de charger la surveillance Keepa. Vérifiez la connexion à PocketBase." />;
    }
}
