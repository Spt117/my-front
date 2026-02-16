import ErrorPage from '@/components/layout/ErrorPage';
import { getServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import Article from './Article';

export default async function Page() {
    try {
        const url = `${pokeUriServer}/wordpress?site=beyblade-x.fr`;
        const res = await getServer(url);
        const data = res?.response?.data?.[0];

        if (!data) {
            return <ErrorPage title="Aucune donnée" message="Aucun article WordPress trouvé." />;
        }

        return (
            <div className="flex flex-col gap-4 p-4 justify-center items-center">
                <Article data={data} />
            </div>
        );
    } catch (e) {
        console.error("Erreur chargement WordPress:", e);
        return <ErrorPage message="Impossible de charger les articles WordPress. Vérifiez la connexion au serveur." />;
    }
}
