'use client';

import { GlobalAnalyticsView } from '@/components/analytics/GlobalAnalyticsView';
import { ShopAnalyticsView } from '@/components/analytics/ShopAnalyticsView';
import { AnalyticsPeriodSelector } from '@/components/analytics/AnalyticsPeriodSelector';
import { PeriodType } from '@/components/analytics/AnalyticsUtils';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { boutiques, IShopify } from '@/params/paramsShopify';
import { ExternalLink, LayoutGrid, Store } from 'lucide-react';
import { useState } from 'react';

export default function ShopifyDashboard() {
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();
    const [viewMode, setViewMode] = useState<'global' | 'shop'>('global');
    const [period, setPeriod] = useState<PeriodType>('today');
    const [customStart, setCustomStart] = useState<Date>(new Date());
    const [customEnd, setCustomEnd] = useState<Date>(new Date());

    const handleShopSelect = (boutique: IShopify) => {
        setShopifyBoutique(boutique);
        setViewMode('shop');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <p className="text-slate-600">
                                {viewMode === 'global' ? 'Vue d\'ensemble de toutes les boutiques' : `Statistiques pour ${shopifyBoutique?.publicDomain}`}
                            </p>
                            {viewMode === 'shop' && shopifyBoutique && (
                                <a
                                    href={`https://admin.shopify.com/store/${shopifyBoutique.domain.replace(".myshopify.com", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-100"
                                >
                                    Admin Shopify
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-white/20 shadow-lg">
                        <button
                            onClick={() => setViewMode('global')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                                viewMode === 'global'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-slate-600 hover:text-purple-500'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Global
                        </button>
                        <div className="w-px h-6 bg-slate-200 my-auto mx-1" />
                        <div className="relative group/shops">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                                    viewMode === 'shop'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-slate-600 hover:text-purple-500'
                                }`}
                            >
                                <Store className="w-4 h-4" />
                                {viewMode === 'shop' && shopifyBoutique ? shopifyBoutique.publicDomain : 'Par Boutique'}
                            </button>
                            
                            {/* Dropdown for shops */}
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover/shops:opacity-100 group-hover/shops:visible transition-all duration-200 z-[100]">
                                {boutiques.map((b) => (
                                    <div key={b.domain} className="group/item flex items-center gap-1">
                                        <button
                                            onClick={() => handleShopSelect(b)}
                                            className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-left truncate"
                                        >
                                            <img src={b.flag} alt="" className="w-5 h-5 object-contain shrink-0" />
                                            <span className="truncate">{b.publicDomain}</span>
                                        </button>
                                        <a
                                            href={`https://admin.shopify.com/store/${b.domain.replace(".myshopify.com", "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-purple-600 transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
                                            title="Ouvrir l'admin Shopify"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Period Selector */}
                <AnalyticsPeriodSelector
                    period={period}
                    setPeriod={setPeriod}
                    customStart={customStart}
                    setCustomStart={setCustomStart}
                    customEnd={customEnd}
                    setCustomEnd={setCustomEnd}
                />

                {/* Main Content */}
                {viewMode === 'global' ? (
                    <GlobalAnalyticsView
                        period={period}
                        customStart={customStart}
                        customEnd={customEnd}
                    />
                ) : (
                    shopifyBoutique && (
                        <ShopAnalyticsView
                            boutique={shopifyBoutique}
                            period={period}
                            customStart={customStart}
                            customEnd={customEnd}
                        />
                    )
                )}
            </div>
        </div>
    );
}
