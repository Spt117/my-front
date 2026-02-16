import ErrorPage from "@/components/layout/ErrorPage";
import { amazonService, IAmazonRecordFull } from "@/library/pocketbase/AmazonService";
import AmazonPage from "./AmazonPage";

export default async function Page() {
    let marketplaces: IAmazonRecordFull[] = [];

    try {
        marketplaces = await amazonService.getAll();
    } catch (e) {
        console.error("Erreur connexion PocketBase:", e);
        return <ErrorPage message="Impossible de se connecter à PocketBase. Vérifiez que le serveur est accessible." />;
    }

    return <AmazonPage marketplaces={marketplaces} />;
}
