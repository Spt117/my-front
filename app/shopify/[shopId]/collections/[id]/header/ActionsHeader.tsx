import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Trash2 } from 'lucide-react';
import Image from 'next/image';
import useCollectionStore from '../../storeCollections';
import Save from './Save';

export default function ActionsHeader() {
    const { shopifyBoutique, openDialog } = useShopifyStore();
    const { dataCollection } = useCollectionStore();

    if (!shopifyBoutique || !dataCollection) return null;

    const collectionUrl = `https://${shopifyBoutique.publicDomain}/collections/${dataCollection.handle}`;

    return (
        <div className="flex gap-2 items-center">
            <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                onClick={() => openDialog(6)} // Assuming this is delete collection dialog
            >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Supprimer</span>
            </Button>

            <Button variant="outline" size="sm" className="rounded-lg gap-2 border-slate-200" asChild>
                <a href={collectionUrl} target="_blank" rel="noopener noreferrer">
                    <Globe size={16} />
                    <span className="hidden sm:inline">Voir en ligne</span>
                    <ExternalLink size={12} className="text-slate-400" />
                </a>
            </Button>

            <Button variant="outline" size="sm" className="rounded-lg gap-2 border-slate-200" asChild>
                <a href={`https://${shopifyBoutique.domain}/admin/collections/${dataCollection.id.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                    <Image src="/shopify.png" alt="Shopify" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                    <span className="hidden sm:inline">Shopify Admin</span>
                </a>
            </Button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1" />

            <Save />
        </div>
    );
}
