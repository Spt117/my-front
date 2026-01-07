'use client';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Badge } from '@/components/ui/badge';
import { useCopy } from '@/library/hooks/useCopy';
import { Tag } from 'lucide-react';
import useCollectionStore from '../../storeCollections';
import ActionsHeader from './ActionsHeader';

export default function HeaderCollection() {
    const { handleCopy } = useCopy();
    const { shopifyBoutique } = useShopifyStore();
    const { dataCollection, collectionTitle } = useCollectionStore();

    if (!shopifyBoutique || !dataCollection) return null;

    const isPublished = dataCollection.resourcePublicationsV2.nodes.length > 0;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Tag size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 onClick={() => handleCopy(collectionTitle)} className="text-2xl font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">
                            {collectionTitle}
                        </h1>
                        <Badge variant="outline" className={isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}>
                            {isPublished ? 'Publié' : 'Brouillon'}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        {dataCollection.products.length} produits • {dataCollection.ruleSet ? 'Collection automatique' : 'Collection manuelle'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <ActionsHeader />
            </div>
        </div>
    );
}
