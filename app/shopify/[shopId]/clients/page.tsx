import MappingClients from '@/components/shopify/clients/MappingClients';
import { boutiqueFromId } from '@/params/paramsShopify';

export default async function ClientsPage({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = await params;
    const boutique = boutiqueFromId(shopId);

    if (!boutique) {
        return <div>Boutique introuvable</div>;
    }

    return (
        <div className="py-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
            <MappingClients shopId={shopId} domain={boutique.domain} />
        </div>
    );
}
