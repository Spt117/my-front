'use client';

import { TDomainsShopify } from '@/params/paramsShopify';
import { ChevronDown, Package } from 'lucide-react';
import { useState } from 'react';
import { OrderedProduct } from '@/app/(home)/serverAction';
import { extractProductId, formatCurrency, getShopIdFromDomain } from './AnalyticsUtils';

interface ProductsTableProps {
    products: OrderedProduct[];
    shopDomain?: TDomainsShopify;
}

export function AnalyticsProductsTable({ products, shopDomain }: ProductsTableProps) {
    const [showAll, setShowAll] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: 'title' | 'sku' | 'quantity' | 'revenue'; direction: 'asc' | 'desc' } | null>(null);

    const shopId = shopDomain ? getShopIdFromDomain(shopDomain) : null;

    const sortedProducts = [...products].sort((a, b) => {
        if (!sortConfig) return 0;

        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortConfig.key) {
            case 'title':
                valA = a.title.toLowerCase();
                valB = b.title.toLowerCase();
                break;
            case 'sku':
                valA = (a.sku || '').toLowerCase();
                valB = (b.sku || '').toLowerCase();
                break;
            case 'quantity':
                valA = a.quantity;
                valB = b.quantity;
                break;
            case 'revenue':
                valA = a.revenue;
                valB = b.revenue;
                break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const displayedProducts = showAll ? sortedProducts : sortedProducts.slice(0, 10);

    const handleSort = (key: 'title' | 'sku' | 'quantity' | 'revenue') => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return null;
            }
            return { key, direction: 'asc' };
        });
    };

    const SortIcon = ({ columnKey }: { columnKey: 'title' | 'sku' | 'quantity' | 'revenue' }) => {
        const isActive = sortConfig?.key === columnKey;
        return (
            <span className={`ml-1 inline-flex transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>
                {isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
            </span>
        );
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun produit commandé sur cette période</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto py-4 px-2 -my-4 -mx-2">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th
                            className="text-left py-4 px-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-purple-600 transition-colors select-none"
                            onClick={() => handleSort('title')}
                        >
                            Produit <SortIcon columnKey="title" />
                        </th>
                        <th
                            className="text-center py-4 px-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-purple-600 transition-colors select-none"
                            onClick={() => handleSort('sku')}
                        >
                            SKU <SortIcon columnKey="sku" />
                        </th>
                        <th
                            className="text-center py-4 px-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-purple-600 transition-colors select-none"
                            onClick={() => handleSort('quantity')}
                        >
                            Quantité <SortIcon columnKey="quantity" />
                        </th>
                        <th
                            className="text-right py-4 px-4 text-sm font-semibold text-slate-600 cursor-pointer hover:text-purple-600 transition-colors select-none"
                            onClick={() => handleSort('revenue')}
                        >
                            CA <SortIcon columnKey="revenue" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayedProducts.map((product, index) => (
                        <tr
                            key={product.productId + index}
                            className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:shadow-sm transition-all duration-200 group ${shopId ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
                            onClick={() => shopId && (window.location.href = `/shopify/${shopId}/products/${extractProductId(product.productId)}`)}
                        >
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-violet-100 group-hover:to-purple-100 transition-all duration-200">
                                            <Package className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                        </div>
                                    )}
                                    <span className="font-medium text-slate-800 line-clamp-2 max-w-xs group-hover:text-purple-700 transition-colors">{product.title}</span>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-mono text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                                    {product.sku || '—'}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-purple-700 font-bold group-hover:from-violet-200 group-hover:to-purple-200 group-hover:shadow-md transition-all duration-200">
                                    {product.quantity}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className="font-semibold text-emerald-600 group-hover:text-emerald-500 transition-colors">{formatCurrency(product.revenue)}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length > 10 && (
                <div className="flex justify-center py-6">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 font-medium hover:from-violet-100 hover:to-purple-100 hover:text-purple-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <ChevronDown className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                        {showAll ? 'Afficher moins' : `Voir les ${products.length - 10} autres produits`}
                    </button>
                </div>
            )}
        </div>
    );
}
