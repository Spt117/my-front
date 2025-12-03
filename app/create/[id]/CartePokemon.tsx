'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { amazonMarketPlaces } from '@/params/paramsAmazon';
import { Package, Store, Tag, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { TaskDetailsProps } from '../util';

export default function CartePokemon({ task }: TaskDetailsProps) {
    const [title, setTitle] = useState<string>('');
    const [productType, setProductType] = useState<string>('');

    useEffect(() => {
        setTitle(task.title);
        setProductType(task.productType);
    }, [task]);

    const marketplace = amazonMarketPlaces.find((m) => m.name === task.marketplace);
    const amazonUrl = marketplace ? `https://${marketplace.domain}/dp/${task.asin}` : '#';

    return (
        <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-border/50">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 w-full">
                        <CardTitle className="text-2xl font-bold leading-tight">
                            <h5 className="text-lg">Titre</h5>
                            <Input value={title} className="w-full" onChange={(e) => setTitle(e.target.value)} />
                        </CardTitle>
                        <CardDescription className="font-bold leading-tight space-y-2">
                            <h5 className="text-lg">Type: Carte</h5>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-8 md:grid-cols-[300px_1fr]">
                    <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted/30">
                        {task.image ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer w-full h-full relative group">
                                        <Image src={task.image} alt={task.title} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-background/80 text-foreground text-xs px-2 py-1 rounded shadow-sm transition-opacity duration-300 pointer-events-none">
                                                Agrandir
                                            </span>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-fit w-auto p-0 overflow-hidden bg-transparent border-none shadow-none">
                                    <DialogTitle className="sr-only">{task.title}</DialogTitle>
                                    <div className="relative bg-white dark:bg-zinc-950 rounded-lg overflow-hidden shadow-2xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={task.image}
                                            alt={task.title}
                                            className="max-h-[80vh] max-w-[90vw] object-contain transition-transform duration-500 hover:scale-150 cursor-zoom-in"
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <Package className="w-12 h-12 opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Tag className="w-4 h-4" />
                                    <span>ASIN</span>
                                </div>
                                <p className="font-medium font-mono">{task.asin}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Store className="w-4 h-4" />
                                    <span>Marketplace</span>
                                </div>
                                <p className="font-medium">{task.marketplace}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="w-4 h-4" />
                                    <span>Produit recherché</span>
                                </div>
                                <p className="font-medium capitalize">{task.productType}</p>
                            </div>

                            {task.brand && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Tag className="w-4 h-4" />
                                        <span>Marque</span>
                                    </div>
                                    <p className="font-medium">{task.brand}</p>
                                </div>
                            )}

                            {task.seller && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        <span>Vendeur</span>
                                    </div>
                                    <p className="font-medium">{task.seller}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
