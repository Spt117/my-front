import ClientDetail from '@/components/shopify/clients/ClientDetail';
import { getFullClient } from '@/components/shopify/clients/serverAction';
import ErrorPage from '@/components/layout/ErrorPage';
import { boutiqueFromId } from '@/params/paramsShopify';

export default async function ClientDetailPage({ params }: { params: Promise<{ shopId: string; clientId: string }> }) {
    const { shopId, clientId } = await params;
    let boutique;
    try {
        boutique = await boutiqueFromId(shopId);
    } catch (error) {
        return <ErrorPage title="Boutique introuvable" message="L'identifiant de boutique est invalide." />;
    }

    try {
        const clientResponse = await getFullClient(boutique.domain, clientId);
        const client = clientResponse.response;

        if (!client) {
            return <ErrorPage title="Client introuvable" message="Désolé, nous n'avons pas pu trouver les informations de ce client." />;
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
                <ClientDetail client={client} shopId={shopId} />
            </div>
        );
    } catch (e) {
        console.error("Erreur chargement client:", e);
        return <ErrorPage message="Impossible de charger les données du client. Vérifiez la connexion au serveur." />;
    }
}
