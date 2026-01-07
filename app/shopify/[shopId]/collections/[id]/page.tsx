'use client';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import useCollectionStore from '../storeCollections';
import Canaux from './Canaux';
import HeaderCollection from './header/HeaderCollection';
import MetaSeo from './MetaSeo';
import ProductCollection from './Product';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { deleteCollectionImage, uploadCollectionImage } from '../server';

export default function Page() {
    const { dataCollection, setCollectionTitle, setCollectionDescriptionHtml, collectionTitle, collectionDescriptionHtml } = useCollectionStore();
    const { shopifyBoutique, openDialog } = useShopifyStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !shopifyBoutique || !dataCollection) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            toast.promise(uploadCollectionImage(shopifyBoutique.domain, dataCollection.id, base64String, file.name), {
                loading: "Téléchargement de l'image...",
                success: (res) => {
                    if (res.error) throw new Error(res.error);
                    router.refresh();
                    return 'Image mise à jour !';
                },
                error: (err) => `Erreur: ${err.message}`,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteImage = async () => {
        if (!shopifyBoutique || !dataCollection) return;

        toast.promise(deleteCollectionImage(shopifyBoutique.domain, dataCollection.id), {
            loading: "Suppression de l'image...",
            success: (res) => {
                if (res.error) throw new Error(res.error);
                router.refresh();
                return 'Image supprimée !';
            },
            error: (err) => `Erreur: ${err.message}`,
        });
    };

    useEffect(() => {
        if (dataCollection) {
            setCollectionTitle(dataCollection.title);
            setCollectionDescriptionHtml(dataCollection.descriptionHtml);
        }
    }, [dataCollection, setCollectionTitle, setCollectionDescriptionHtml]);

    if (!dataCollection || !shopifyBoutique) return null;

    const { image, products, ruleSet, updatedAt } = dataCollection;

    return (
        <div className="flex flex-col gap-8 p-6 max-w-[1600px] mx-auto w-full">
            {/* Top Navigation & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span className="hover:text-slate-900 cursor-pointer" onClick={() => window.history.back()}>
                        Collections
                    </span>
                    <span>/</span>
                    <span className="text-slate-900 font-medium">{collectionTitle}</span>
                </div>
                <HeaderCollection />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Information */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                            <h3 className="font-bold text-slate-800">Informations générales</h3>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Titre</label>
                                <input
                                    value={collectionTitle}
                                    onChange={(e) => setCollectionTitle(e.target.value)}
                                    className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
                                    placeholder="Titre de la collection"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    value={collectionDescriptionHtml}
                                    onChange={(e) => setCollectionDescriptionHtml(e.target.value)}
                                    rows={8}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none text-slate-600 leading-relaxed font-mono text-sm"
                                    placeholder="Code HTML de la description..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products List */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-slate-800">Produits</h3>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none rounded-full">
                                    {products.length}
                                </Badge>
                            </div>
                            {!ruleSet && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2" onClick={() => openDialog(8)}>
                                    Ajouter des produits
                                </Button>
                            )}
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <ProductCollection key={product.id} product={product} />
                                ))}
                            </div>
                            {products.length === 0 && (
                                <div className="text-center py-20 px-6">
                                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Image src="/no_image.png" width={32} height={32} alt="Empty" className="opacity-20" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1">Aucun produit</h4>
                                    <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
                                        Cette collection est vide. Commencez par ajouter des produits pour les afficher sur votre boutique.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Publication Status */}
                    <Canaux collection={dataCollection} />

                    {/* Collection Image */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                            <h3 className="font-bold text-slate-800 text-sm">Image de la collection</h3>
                        </div>
                        <CardContent className="p-4">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            {image?.src ? (
                                <div
                                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.altText || collectionTitle}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteImage();
                                            }}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                                >
                                    <div className="p-3 bg-slate-50 rounded-full mb-3 text-slate-400 pointer-events-none">
                                        <Image src="/no_image.png" width={24} height={24} alt="Upload" className="opacity-40" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 pointer-events-none">Ajouter une image</span>
                                    <span className="text-xs text-slate-500 mt-1 pointer-events-none">Format recommandé : 1200x1200px</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <MetaSeo />

                    {/* Stats & Metadata */}
                    <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                <span className="text-white/60">Dernière modification</span>
                                <span className="font-medium text-white">{new Date(updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                <span className="text-white/60">Type</span>
                                <Badge className={ruleSet ? 'bg-blue-500/20 text-blue-300 border-none' : 'bg-emerald-500/20 text-emerald-300 border-none'}>
                                    {ruleSet ? 'Automatique' : 'Manuelle'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">Visibilité produit</span>
                                <span className="font-medium text-white">{products.length} articles</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
