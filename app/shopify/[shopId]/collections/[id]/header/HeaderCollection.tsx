'use client';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { useCopy } from '@/library/hooks/useCopy';
import { Tag } from 'lucide-react';
import useCollectionStore from '../../storeCollections';
import ActionsHeader from './ActionsHeader';

export default function HeaderCollection() {
    const { handleCopy } = useCopy();
    const { shopifyBoutique } = useShopifyStore();
    const { dataCollection } = useCollectionStore();

    if (!shopifyBoutique || !dataCollection) return null;

    return (
        <CardHeader className="sticky top-12 w-full z-10 bg-gray-50 ">
            <div className="flex items-center justify-between gap-3">
                <CardTitle
                    onClick={() => {
                        handleCopy(dataCollection.title);
                    }}
                    className="flex flex-shrink-0 items-center gap-2 text-lg font-semibold cursor-pointer transition-transform duration-500 ease-out active:scale-85"
                    title="Cliquer pour copier le titre"
                >
                    <Tag size={20} className={`text-gray-500`} />
                    {dataCollection.title}
                </CardTitle>
                <div className="text-sm text-gray-500">{dataCollection.products.length} produits</div>

                <ActionsHeader />
            </div>
        </CardHeader>
    );
}
