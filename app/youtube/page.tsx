import ErrorPage from "@/components/layout/ErrorPage";
import { getYoutubeChannels } from "./actions";
import YouTubeChannels from "./YouTubeChannels";

export default async function Page() {
    try {
        const channels = await getYoutubeChannels();
        return <YouTubeChannels initialChannels={channels} />;
    } catch (e) {
        console.error("Erreur chargement chaines YouTube:", e);
        return <ErrorPage message="Impossible de charger les chaines YouTube. Verifiez la connexion au serveur." />;
    }
}
