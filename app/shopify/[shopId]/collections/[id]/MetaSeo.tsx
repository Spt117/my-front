import CopyComponent from '@/components/Copy';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useEffect } from 'react';
import useCollectionStore from '../storeCollections';

export default function MetaSeo() {
    const { shopifyBoutique } = useShopifyStore();
    const { dataCollection, setMetaTitle, setMetaDescription, setAncreUrl, redirectionUrl, setRedirectionUrl, metaDescription, metaTitle, ancreUrl } = useCollectionStore();

    const metaTitleCollection = dataCollection?.seo.title;
    const metaDescriptionCollection = dataCollection?.seo.description;

    useEffect(() => {
        if (metaTitleCollection) setMetaTitle(metaTitleCollection);
        if (metaDescriptionCollection) setMetaDescription(metaDescriptionCollection);
        if (dataCollection?.handle) setAncreUrl(dataCollection.handle);
    }, [metaTitleCollection, metaDescriptionCollection, dataCollection?.handle]);

    if (!dataCollection) return null;

    const url = `https://${shopifyBoutique?.publicDomain}/collections/${ancreUrl}`;

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
                <Search size={16} className="text-slate-500" />
                <h3 className="font-bold text-slate-800 text-sm">Référencement (SEO)</h3>
            </div>
            <CardContent className="p-4 space-y-6">
                {/* Search Engine Preview */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aperçu Google</span>
                    <h4 className="text-blue-700 font-medium text-base leading-tight truncate">{metaTitle || dataCollection.title}</h4>
                    <p className="text-emerald-700 text-xs truncate">{url}</p>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{metaDescription || dataCollection.description || 'Aucune description fournie...'}</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5 w-full">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Titre de la page</Label>
                        <Input
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            className="bg-white border-slate-200 rounded-lg h-9 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full"
                        />
                        <div className="flex justify-end">
                            <span className={`text-[10px] font-medium ${metaTitle.length > 70 ? 'text-red-500' : 'text-slate-400'}`}>{metaTitle.length} / 70</span>
                        </div>
                    </div>

                    <div className="space-y-1.5 w-full">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Méta description</Label>
                        <textarea
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600"
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <span className={`text-[10px] font-medium ${metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{metaDescription.length} / 160</span>
                        </div>
                    </div>

                    <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">URL de la collection</Label>
                            <CopyComponent contentToCopy={url} message="URL copiée !" size={14} />
                        </div>
                        <div className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">/collections/</span>
                            <Input
                                value={ancreUrl}
                                onChange={(e) => setAncreUrl(e.target.value)}
                                className="pl-[85px] bg-white border-slate-200 rounded-lg h-9 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full"
                            />
                        </div>

                        {ancreUrl.trim() !== dataCollection.handle && (
                            <div
                                onClick={() => setRedirectionUrl(!redirectionUrl)}
                                className="flex items-center gap-2 p-3 mt-3 rounded-lg border border-blue-100 bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <Checkbox checked={redirectionUrl} onCheckedChange={(val) => setRedirectionUrl(!!val)} />
                                <Label className="text-[11px] font-medium text-blue-700 cursor-pointer leading-tight">
                                    Créer une redirection de <strong>/{dataCollection.handle}</strong> vers cette nouvelle URL
                                </Label>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
