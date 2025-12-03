import CopyComponent from '@/components/Copy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/shadcn-io/spinner/index';
import useKeyboardShortcuts from '@/library/hooks/useKyboardShortcuts';
import { TPokemonProducts } from '@/params/paramsCreateAffiliation';
import { boutiqueFromPublicDomain, TPublicDomainsShopify } from '@/params/paramsShopify';
import { IconCategoryFilled } from '@tabler/icons-react';
import { Globe, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { archiveTaskStatus, createCarte } from '../serverTasksAffiliation';
import { useAffiliationTask } from './ContextTaskAffiliation';
import Inputs from './Inputs';

export default function TaskAffiliation() {
    const { task, productType, setProductType, loading, setLoading, handleCreateProduct, disabledPush } = useAffiliationTask();
    const { size, setSize, setNamePokemon, namePokemon } = useAffiliationTask();

    const router = useRouter();

    const handleArchive = async () => {
        setLoading(true);
        try {
            const res = await archiveTaskStatus(task.asin, task.website);
            toast.success('Tâche archivée avec succès ' + res);
            // Optionally, you can add a success message or update the UI accordingly
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
            // Optionally, you can add a success message or update the UI accordingly
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

    // Couleurs des badges selon le statut
    const statusStyles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        done: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };
    const [showImageModal, setShowImageModal] = useState(false);
    useKeyboardShortcuts('Escape', () => setShowImageModal(false));

    return (
        <>
            <Card className="relative flex-1 min-w-[350px] max-w-[400px] shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Badge className={`${statusStyles[task.status]} capitalize absolute top-1 right-2`}>{task.status}</Badge>
                <CardHeader className="flex flex-row items-center gap-4">
                    <img src={task.image} alt={task.title} className="w-16 h-16 object-cover rounded-md cursor-pointer" onClick={() => setShowImageModal(true)} />
                    <div>
                        <Link href={`/create/${task._id}`} rel="noopener noreferrer" className="text-blue-800 hover:underline">
                            <CardTitle className="text-lg font-semibold line-clamp-2">{task.title}</CardTitle>
                        </Link>
                        {task.brand && <p className="text-sm text-gray-500">{task.brand}</p>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm flex items-center gap-1">
                            ASIN:
                            <CopyComponent size={18} contentToCopy={task.asin} message="ASIN copié !">
                                {task.asin}
                            </CopyComponent>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconCategoryFilled className="w-4 h-4 text-gray-500" />
                        <span className="text-sm flex items-center">Type:</span>
                        <Input className="w-max h-7" value={productType} onChange={(e) => setProductType(e.target.value as TPokemonProducts)} />
                    </div>
                    <Inputs size={size} setSize={setSize} productType={productType} setNamePokemon={setNamePokemon} namePokemon={namePokemon} />
                    {task.price && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm flex items-center gap-1">Prix: {task.price} €</span>
                        </div>
                    )}
                    {task.seller && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm flex items-center gap-1">Vendeur: {task.seller}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                            Marketplace:{' '}
                            <Link href={`https://${task.marketplace}/dp/${task.asin}`} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline">
                                {task.marketplace}
                            </Link>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Site: {task.website}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 justify-center">
                        {!loading && (
                            <>
                                <Button disabled={loading || disabledPush} size="sm" onClick={handleCreateProduct}>
                                    Créer le produit
                                </Button>
                                <Button disabled={loading || disabledPush} size="sm" onClick={handleCreateCarte}>
                                    Créer la carte
                                </Button>
                                <Button disabled={loading} variant="outline" onClick={handleArchive}>
                                    Archiver
                                </Button>
                            </>
                        )}
                        {loading && <Spinner />}
                    </div>
                </CardContent>
            </Card>

            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
                    <Card className="max-w-2xl w-full shadow-2xl">
                        <div className="relative">
                            <img src={task.image} alt={task.title} className="w-full h-auto object-cover rounded-lg" />
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-200 transition-colors"
                            ></button>
                            <div className="p-4 bg-white rounded-b-lg">
                                <h2 className="font-semibold text-lg">{task.title}</h2>
                                {task.brand && <p className="text-sm text-gray-500">{task.brand}</p>}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
