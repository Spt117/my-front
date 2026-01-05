import ClientDetail from '@/components/shopify/clients/ClientDetail';
import { getFullClient } from '@/components/shopify/clients/serverAction';
import { boutiqueFromId } from '@/params/paramsShopify';

export default async function ClientDetailPage({ params }: { params: Promise<{ shopId: string; clientId: string }> }) {
    const { shopId, clientId } = await params;
    const boutique = boutiqueFromId(shopId);

    if (!boutique) {
        return <div className="p-8 text-center text-red-500 font-bold">Boutique introuvable</div>;
    }

    const client = await getFullClient(boutique.domain, clientId);

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">!</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Client introuvable</h1>
                <p className="text-gray-500">Désolé, nous n'avons pas pu trouver les informations de ce client.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
            <ClientDetail client={client} shopId={shopId} />
        </div>
    );
}
