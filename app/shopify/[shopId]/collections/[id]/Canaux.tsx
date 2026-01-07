import useShopifyStore from '@/components/shopify/shopifyStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';
import useCollectionStore from '../storeCollections';
import { ShopifyCollectionWithProducts } from '../utils';

export default function Canaux({ collection }: { collection: ShopifyCollectionWithProducts }) {
    const { shopifyBoutique, canauxBoutique, openDialog } = useShopifyStore();
    const { setCanauxCollection, canauxCollection } = useCollectionStore();
    const canauxP =
        collection?.resourcePublicationsV2.nodes.map((c) => ({
            id: c.publication.id,
            isPublished: c.isPublished,
        })) || [];

    const setInitialCanaux = () => {
        const canauxActives = canauxBoutique.map((c) => {
            const found = collection?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
            if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
            else return { id: c.id, isPublished: false, name: c.name };
        });
        setCanauxCollection(canauxActives);
    };

    useEffect(() => {
        setInitialCanaux();
    }, [collection, canauxBoutique]);

    if (!shopifyBoutique) return null;

    const selectedCount = canauxCollection.filter((c) => c.isPublished).length;

    const handleClickCanal = (canalId: string) => {
        const thisCanal = canauxCollection.find((c) => c.id === canalId);
        if (!thisCanal) return;
        setCanauxCollection(canauxCollection.map((c) => (c.id === canalId ? { ...c, isPublished: !c.isPublished } : c)));
    };

    const allPublished = canauxCollection.every((c) => c.isPublished);

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe size={16} className="text-slate-500" />
                    <h3 className="font-bold text-slate-800 text-sm">Disponibilité</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-full text-[10px] px-1.5">
                    {selectedCount} actif
                </Badge>
            </div>
            <CardContent className="p-4 space-y-4">
                <div
                    onClick={() => {
                        setCanauxCollection(canauxCollection.map((c) => ({ ...c, isPublished: !allPublished })));
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        allPublished ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
                    }`}
                >
                    <Checkbox checked={allPublished} />
                    <span className="text-sm font-semibold text-slate-700">Tous les canaux</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {canauxCollection.map((canal) => (
                        <div
                            key={canal.id}
                            onClick={() => handleClickCanal(canal.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                canal.isPublished ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                            <Checkbox checked={canal.isPublished} className={canal.isPublished ? 'border-emerald-500 data-[state=checked]:bg-emerald-500' : ''} />
                            <span className="text-xs font-medium">{canal.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
