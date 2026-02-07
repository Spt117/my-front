import CopyComponent from '@/components/Copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner/index';
import useKeyboardShortcuts from '@/library/hooks/useKyboardShortcuts';
import { TPokemonProducts } from '@/params/paramsCreateAffiliation';
import { boutiqueFromPublicDomain, TPublicDomainsShopify } from '@/params/paramsShopify';
import { IconCategoryFilled } from '@tabler/icons-react';
import { Archive, Globe, Package, Plus, SquarePlus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { archiveTaskStatus, createCarte } from '../serverTasksAffiliation';
import { useAffiliationTask } from './ContextTaskAffiliation';
import Inputs from './Inputs';

const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-amber-500/20 text-amber-200 border-2 border-amber-500/40 font-semibold', label: 'En attente' },
    done: { className: 'bg-emerald-500/20 text-emerald-200 border-2 border-emerald-500/40 font-semibold', label: 'Terminé' },
    error: { className: 'bg-red-500/20 text-red-200 border-2 border-red-500/40 font-semibold', label: 'Erreur' },
};

export default function TaskAffiliation() {
    const { task, productType, setProductType, loading, setLoading, handleCreateProduct, disabledPush } = useAffiliationTask();
    const { size, setSize, setNamePokemon, namePokemon } = useAffiliationTask();

    const router = useRouter();

    const handleArchive = async () => {
        setLoading(true);
        try {
            const res = await archiveTaskStatus(task.asin, task.website);
            toast.success('Tâche archivée avec succès ' + res);
            router.refresh();
        } catch (error) {
            toast.error("Échec de l'archivage de la tâche");
            console.error('Failed to archive task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCarte = async () => {
        setLoading(true);
        try {
            const res = await createCarte(task.asin);
            if (res.error) toast.error(res.error);

            if (res.message) toast.success(res.message);
            if (res.response?.id) {
                const id = res.response.id;
                const boutique = boutiqueFromPublicDomain(task.website as TPublicDomainsShopify);
                const url = `/shopify/${boutique.id}/products/${id.replace('gid://shopify/Product/', '')}`;
                window.open(url, '_blank');
            }
            router.refresh();
        } catch (error) {
            toast.error('Échec de la création de la carte');
            console.error('Failed to create carte:', error);
        } finally {
            setLoading(false);
        }
    };

    const [showImageModal, setShowImageModal] = useState(false);
    useKeyboardShortcuts('Escape', () => setShowImageModal(false));

    const status = statusConfig[task.status] || statusConfig.pending;

    return (
        <>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
                {/* Header: image + infos */}
                <div className="flex gap-4 p-4">
                    {/* Image */}
                    <img
                        src={task.image}
                        alt={task.title}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setShowImageModal(true)}
                    />

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <Link href={`/create/${task._id}`} className="hover:underline min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 leading-tight">{task.title}</h3>
                            </Link>
                            <Badge className={`${status.className} text-xs shrink-0 px-2.5 py-1`}>{status.label}</Badge>
                        </div>
                        {task.brand && <p className="text-xs text-gray-400">{task.brand}</p>}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                            <Package className="w-3 h-3" />
                            <CopyComponent size={14} contentToCopy={task.asin} message="ASIN copié !">
                                {task.asin}
                            </CopyComponent>
                        </div>
                    </div>
                </div>

                {/* Détails */}
                <div className="px-4 pb-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <IconCategoryFilled className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-gray-400">Type:</span>
                        <Input
                            className="h-6 text-xs bg-gray-800 border-gray-700 text-gray-100 flex-1"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value as TPokemonProducts)}
                        />
                    </div>

                    <Inputs size={size} setSize={setSize} productType={productType} setNamePokemon={setNamePokemon} namePokemon={namePokemon} />

                    {task.price && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="text-emerald-400 font-medium">{task.price} €</span>
                        </div>
                    )}

                    {task.seller && (
                        <div className="text-xs text-gray-400">
                            Vendeur: <span className="text-gray-300">{task.seller}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-blue-400" />
                            <Link
                                href={`https://${task.marketplace}/dp/${task.asin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                {task.marketplace}
                            </Link>
                        </span>
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-500" />
                            {task.website}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-white/5 px-4 py-3">
                    {loading ? (
                        <div className="flex justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                disabled={disabledPush}
                                size="sm"
                                onClick={handleCreateProduct}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs h-8"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Produit
                            </Button>
                            <Button
                                disabled={disabledPush}
                                size="sm"
                                onClick={handleCreateCarte}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                            >
                                <SquarePlus className="w-3.5 h-3.5 mr-1" />
                                Carte
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleArchive}
                                className="bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 text-xs h-8"
                            >
                                <Archive className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal image */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-2xl w-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-gray-300 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img src={task.image} alt={task.title} className="w-full h-auto object-cover" />
                        <div className="p-4">
                            <h2 className="font-semibold text-lg text-gray-100">{task.title}</h2>
                            {task.brand && <p className="text-sm text-gray-400 mt-1">{task.brand}</p>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
