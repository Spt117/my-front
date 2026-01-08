'use client';
import { ProductGET } from '@/library/types/graph';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import useShopifyStore from '../../shopify/shopifyStore';

export default function ProductList({ product }: { product: ProductGET }) {
    const { shopifyBoutique, setIsSearchOpen } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);

    // Return conditionnel APRÈS tous les hooks
    if (!shopifyBoutique) return null;

    const id = product.id.split('/').pop();
    const url = `/shopify/${shopifyBoutique.id}/products/${id}`;
    const productUrl = `https://${shopifyBoutique.publicDomain}/products/${product.handle}`;

    // Fonction pour gérer le clic sur l'icône d'œil et ouvrir le lien externe
    const handleViewOnStoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Empêche le clic de se propager au Link parent
        e.preventDefault();
        e.stopPropagation();

        // Ouvre le lien du produit dans un nouvel onglet
        window.open(productUrl, '_blank', 'noopener,noreferrer');
    };

    const canaux = product.resourcePublicationsV2.nodes.length;

    return (
        <Link
            href={url}
            onClick={() => setIsSearchOpen(false)}
            className="flex items-center hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm pr-2 relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Bouton de visualisation externe */}
            <div
                onClick={handleViewOnStoreClick}
                className="p-1 hover:bg-gray-200 rounded-md absolute right-3 z-10 cursor-pointer"
                title="Afficher sur votre boutique"
            >
                <span className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Eye size={20} color={isHovered ? 'currentColor' : 'transparent'} />
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
                <h3 className="w-1/4 text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
                <div className="w-1/6 text-sm text-primary">{`${product.variants?.nodes[0]?.price} ${shopifyBoutique?.devise}`}</div>
                <div className="w-1/6 text-sm text-primary">Stock: {product.variants?.nodes[0]?.inventoryQuantity}</div>
                <div className="w-1/6 text-sm text-primary">{`${product.productType} `}</div>
                <div className="w-1/6 text-sm text-primary">{`${product.status} `}</div>
                <div className="w-1/6 text-sm text-primary">
                    Publié sur {canaux} {canaux > 1 ? 'canaux' : 'canal'}
                </div>
            </div>
        </Link>
    );
}
