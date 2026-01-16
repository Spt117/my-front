'use client';

import { Package, PlusCircle, ChevronDown, CheckCircle2, Clock, Archive } from 'lucide-react';
import { useState } from 'react';
import { getShopIdFromDomain, extractProductId } from './AnalyticsUtils';
import { TDomainsShopify } from '@/params/paramsShopify';

interface CreatedProductsTableProps {
    products: any[];
    shopDomain?: TDomainsShopify;
}

export function CreatedProductsTable({ products, shopDomain }: CreatedProductsTableProps) {
    const [showAll, setShowAll] = useState(false);
    
    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <PlusCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Aucun nouveau produit créé sur cette période</p>
            </div>
        );
    }

    const shopId = shopDomain ? getShopIdFromDomain(shopDomain) : null;
    const sortedProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const displayedProducts = showAll ? sortedProducts : sortedProducts.slice(0, 10);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
            case 'DRAFT': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
            case 'ARCHIVED': return <Archive className="w-3.5 h-3.5 text-slate-500" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Actif';
            case 'DRAFT': return 'Brouillon';
            case 'ARCHIVED': return 'Archivé';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProducts.map((product) => {
                    const productId = extractProductId(product.id);
                    const imageUrl = product.images?.nodes?.[0]?.url || product.media?.nodes?.[0]?.image?.url;
                    const date = new Date(product.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    return (
                        <div 
                            key={product.id}
                            onClick={() => shopId && (window.location.href = `/shopify/${shopId}/products/${productId}`)}
                            className={`flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group ${shopId ? 'cursor-pointer' : ''}`}
                        >
                            <div className="relative shrink-0">
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl} 
                                        alt={product.title} 
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-1">
                                    {getStatusIcon(product.status)}
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                        {getStatusText(product.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-800 text-sm truncate group-hover:text-purple-600 transition-colors">
                                    {product.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-slate-50 rounded-md text-[10px] font-medium text-slate-500 border border-slate-100">
                                        {product.productType || 'Produit'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        Créé le {date}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {products.length > 10 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer border border-slate-100 hover:border-purple-100"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                        {showAll ? 'Réduire' : `Voir les ${products.length - 10} autres produits`}
                    </button>
                </div>
            )}
        </div>
    );
}
