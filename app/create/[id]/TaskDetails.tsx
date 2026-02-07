"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, DollarSign, ExternalLink, Globe, Package, Store, Tag, User } from "lucide-react";
import Image from "next/image";
import { TaskDetailsProps } from "../util";

export function TaskDetails({ task }: TaskDetailsProps) {
    const statusColor = {
        pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25",
        done: "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25",
        error: "bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25",
    };

    const amazonUrl = task.marketplace ? `https://${task.marketplace}/dp/${task.asin}` : "#";

    return (
        <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-border/50">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold leading-tight">{task.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{task._id}</span>
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={`capitalize px-3 py-1 border-0 ${statusColor[task.status]}`}>
                        {task.status}
                    </Badge>
                </div>
            </CardHeader>
            <Separator />
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
                                    <DollarSign className="w-4 h-4" />
                                    <span>Prix</span>
                                </div>
                                <p className="font-medium">{task.price ? `${task.price} €` : "N/A"}</p>
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
                                    <Globe className="w-4 h-4" />
                                    <span>Site Web</span>
                                </div>
                                <p className="font-medium">{task.website}</p>
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

                        <div className="flex justify-end pt-4">
                            <Button asChild className="gap-2 w-full sm:w-auto">
                                <a href={amazonUrl} target="_blank" rel="noopener noreferrer">
                                    Voir sur Amazon
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="bg-muted/30 p-4 text-xs text-muted-foreground flex justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Créé le {task.createdAt ? format(new Date(task.createdAt), "dd MMM yyyy à HH:mm", { locale: fr }) : "-"}</span>
                </div>
                {task.updatedAt && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mis à jour le {format(new Date(task.updatedAt), "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
