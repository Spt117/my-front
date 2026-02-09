'use client';
import { updateCanauxVente, updateProduct } from '@/app/shopify/[shopId]/products/[productId]/serverAction';
import { TDomainsShopify } from '@/params/paramsShopify';
import { ProductGET } from '@/library/types/graph';
import { ExternalLink, Eye, Loader2, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import useShopifyStore from '../../shopify/shopifyStore';

export default function ProductList({ product, compact }: { product: ProductGET; compact?: boolean }) {
    const { shopifyBoutique, setIsSearchOpen, setProduct, canauxBoutique } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const router = useRouter();

    // Return conditionnel APRÈS tous les hooks
    if (!shopifyBoutique) return null;

    const id = product.id.split('/').pop();
    const url = `/shopify/${shopifyBoutique.id}/products/${id}`;
    const productUrl = `https://${shopifyBoutique.publicDomain}/products/${product.handle}`;
    const adminUrl = `https://${shopifyBoutique.domain}/admin/products/${id}`;

    const handleExternalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(compact ? adminUrl : productUrl, '_blank', 'noopener,noreferrer');
    };

    const handleQuickPublish = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPublishing(true);
        try {
            const res = await updateProduct(shopifyBoutique.domain as TDomainsShopify, product.id, 'Statut', 'ACTIVE');
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);

            const itemsToPublish = canauxBoutique.map((c) => ({ id: c.id, isPublished: true }));
            const resCan = await updateCanauxVente(shopifyBoutique.domain as TDomainsShopify, product.id, itemsToPublish);
            if (resCan.error) toast.error(resCan.error);
            if (resCan.message) toast.success(resCan.message);

            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la publication rapide');
        } finally {
            setPublishing(false);
        }
    };

    const canaux = product.resourcePublicationsV2.nodes.length;

    return (
        <Link
            href={url}
            onClick={() => {
                setIsSearchOpen(false);
                setProduct(null); // Vide le produit actuel immédiatement
            }}
            className="flex items-center hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm pr-2 relative cursor-pointer"

            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Bouton de lien externe */}
            <div
                onClick={handleExternalClick}
                className="p-1 hover:bg-gray-200 rounded-md absolute right-3 z-10 cursor-pointer"
                title={compact ? "Ouvrir dans l'admin Shopify" : "Afficher sur votre boutique"}
            >
                <span className="text-slate-400 hover:text-slate-600 transition-colors">
                    {compact
                        ? <ExternalLink size={18} color={isHovered ? 'currentColor' : 'transparent'} />
                        : <Eye size={20} color={isHovered ? 'currentColor' : 'transparent'} />
                    }
                </span>
            </div>

            {/* Contenu du produit */}
            <div className="w-full flex items-center py-3 px-4 justify-start gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                        src={product.media?.nodes[0]?.image?.url || '/no_image.png'}
                        alt={product.title}
                        fill
                        className="object-cover rounded-md"
                        sizes="48px"
                        priority={false}
                    />
                </div>
                <h3 className={`${compact ? 'flex-1' : 'w-1/5'} text-sm font-medium text-foreground line-clamp-1`}>{product.title}</h3>
                {compact && (
                    <span className="text-xs text-gray-400 truncate max-w-[250px]">
                        /{product.handle}
                    </span>
                )}
                {!compact && <div className="w-[10%] text-sm text-primary">{`${product.variants?.nodes[0]?.price} ${shopifyBoutique?.devise}`}</div>}
                {!compact && <div className="w-[8%] text-sm text-primary">Stock: {product.variants?.nodes[0]?.inventoryQuantity}</div>}
                {!compact && (
                    <div className="w-[12%] text-sm text-gray-500 font-mono truncate" title={product.variants?.nodes[0]?.sku || ''}>
                        {product.variants?.nodes[0]?.sku || '-'}
                    </div>
                )}
                {!compact && <div className="w-[10%] text-sm text-primary">{`${product.productType} `}</div>}
                {!compact && <div className="w-[8%] text-sm text-primary">{`${product.status} `}</div>}
                {!compact && (
                    <div className="w-[12%] text-sm text-primary">
                        Publié sur {canaux} {canaux > 1 ? 'canaux' : 'canal'}
                    </div>
                )}
                {compact && (
                    <button
                        onClick={handleQuickPublish}
                        disabled={publishing}
                        className="ml-2 mr-6 flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                        title="Passer en ACTIVE et publier sur tous les canaux"
                    >
                        {publishing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        Publier
                    </button>
                )}
            </div>
        </Link>
    );
}
