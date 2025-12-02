import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TAffiliationTask } from '@/library/models/tasksAffiliation/tasksAffiliation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, DollarSign, Globe, Package, Store, Tag, User } from 'lucide-react';
import Image from 'next/image';

interface TaskDetailsProps {
    task: TAffiliationTask;
}

export function TaskDetails({ task }: TaskDetailsProps) {
    const statusColor = {
        pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25',
        done: 'bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25',
        error: 'bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25',
    };

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
                            <Image src={task.image} alt={task.title} fill className="object-contain p-4 hover:scale-105 transition-transform duration-300" />
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
                                <p className="font-medium">{task.price ? `${task.price} €` : 'N/A'}</p>
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
                                    <span>Type de produit</span>
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
            <Separator />
            <CardFooter className="bg-muted/30 p-4 text-xs text-muted-foreground flex justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Créé le {task.createdAt ? format(new Date(task.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr }) : '-'}</span>
                </div>
                {task.updatedAt && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mis à jour le {format(new Date(task.updatedAt), 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
