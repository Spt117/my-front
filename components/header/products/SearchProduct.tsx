import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import useShopifyStore from '../../shopify/shopifyStore';
import { Input } from '../../ui/input';
import { search } from '../serverSearch';
import ListProducts from './ListProducts';

export default function SearchProduct() {
    const { shopifyBoutique, setProductsSearch, searchTerm, setSearchTerm, loading, setLoading } = useShopifyStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const latestQueryRef = useRef<string>(''); // Track la requête la plus récente
    const { openDialog } = useShopifyStore();
    const pathName = usePathname();

    // Vider la recherche lors du changement de page
    useEffect(() => {
        setSearchTerm('');
        setProductsSearch([]);
    }, [pathName]);

    const handleSearch = async (query: string) => {
        if (!query.trim() || !shopifyBoutique) {
            setLoading(false);
            return;
        }

        // Stocker la requête actuelle
        latestQueryRef.current = query;

        try {
            const res = await search(query.trim(), shopifyBoutique.domain);
            // Vérifier que cette réponse correspond à la requête la plus récente
            if (latestQueryRef.current === query) {
                setProductsSearch(res);
            }
            // Si ce n'est pas la requête la plus récente, on ignore les résultats
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
        } finally {
            // Ne pas désactiver loading si une autre requête est en cours
            if (latestQueryRef.current === query) {
                setLoading(false);
            }
        }
    };

    // Gestion des touches clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchTerm('');
                setProductsSearch([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSearchTerm, setProductsSearch]);

    // Effet de debounce pour la recherche
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!searchTerm || !searchTerm.trim()) {
            setProductsSearch([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        timeoutRef.current = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchTerm, shopifyBoutique]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex-1 flex gap-2">
            {/* <ShopifySelect /> */}
            <div className="relative flex-1">
                <div className="w-full flex gap-2">
                    <div className="relative w-full">
                        <Input
                            disabled={!shopifyBoutique}
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            placeholder="Produit Shopify"
                            className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                        />

                        {searchTerm && !loading && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                aria-label="Effacer la recherche"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                    <Button onClick={() => openDialog(1)} aria-label="Ajouter un produit" className="p-2" title="Ajouter un produit">
                        <Plus size={16} />
                    </Button>
                </div>
                {/* Liste des produits positionnée sous l'input */}
                {pathName.split('/').pop() !== 'products' && <ListProducts />}
            </div>
        </div>
    );
}
