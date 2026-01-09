'use client';

import { AnalyticsData, getAnalytics } from '@/app/(home)/serverAction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { boutiques, IShopify } from '@/params/paramsShopify';
import { DollarSign, Package, RefreshCw, ShoppingCart, Store, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, getDateRange, PeriodType } from './AnalyticsUtils';
import { KPICard } from './KPICard';

interface GlobalAnalyticsViewProps {
    period: PeriodType;
    customStart: Date;
    customEnd: Date;
}

interface BoutiqueStats {
    boutique: IShopify;
    data: AnalyticsData | null;
    loading: boolean;
    error: string | null;
}

export function GlobalAnalyticsView({ period, customStart, customEnd }: GlobalAnalyticsViewProps) {
    const [stats, setStats] = useState<BoutiqueStats[]>(
        boutiques.map((b) => ({ boutique: b, data: null, loading: true, error: null }))
    );

    const fetchAllAnalytics = useCallback(async () => {
        const { start, end } = getDateRange(period, customStart, customEnd);

        setStats((prev) => prev.map((s) => ({ ...s, loading: true, error: null })));

        const promises = boutiques.map(async (boutique, index) => {
            try {
                const res = await getAnalytics({
                    domain: boutique.domain,
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                });

                if (res.error) throw new Error(res.error);

                setStats((prev) => {
                    const newStats = [...prev];
                    newStats[index] = { ...newStats[index], data: res.response, loading: false };
                    return newStats;
                });
            } catch (err) {
                setStats((prev) => {
                    const newStats = [...prev];
                    newStats[index] = { ...newStats[index], loading: false, error: 'Erreur' };
                    return newStats;
                });
            }
        });

        await Promise.all(promises);
    }, [period, customStart, customEnd]);

    useEffect(() => {
        fetchAllAnalytics();
    }, [fetchAllAnalytics]);

    const totalRevenue = stats.reduce((sum, s) => sum + (s.data?.totalRevenue || 0), 0);
    const totalOrders = stats.reduce((sum, s) => sum + (s.data?.ordersCount || 0), 0);
    const totalProducts = stats.reduce((sum, s) => sum + (s.data?.orderedProducts.reduce((pSum, p) => pSum + p.quantity, 0) || 0), 0);

    const chartData = stats
        .filter((s) => s.data)
        .map((s) => ({
            name: s.boutique.publicDomain,
            CA: s.data?.totalRevenue || 0,
            Commandes: s.data?.ordersCount || 0,
        }))
        .sort((a, b) => b.CA - a.CA);

    return (
        <div className="space-y-6">
            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                    title="CA Total Global"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700"
                    subtitle="Toutes boutiques confondues"
                />
                <KPICard
                    title="Commandes Globales"
                    value={totalOrders}
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700"
                    subtitle="Volume total des ventes"
                />
                <KPICard
                    title="Produits Vendus"
                    value={totalProducts}
                    icon={Package}
                    gradient="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700"
                    subtitle="Nombre d'articles expédiés"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Comparison Chart */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            Comparatif par Boutique (CA)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={150} 
                                        tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar dataKey="CA" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#a855f7'} opacity={1 - index * 0.15} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recap Table */}
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <Store className="w-5 h-5 text-purple-500" />
                            Récap par Boutique
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {stats.map((s) => (
                                <div key={s.boutique.domain} className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                            <img src={s.boutique.flag} alt={s.boutique.langue} className="w-6 h-6 object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{s.boutique.publicDomain}</p>
                                            <p className="text-xs text-slate-500">{s.boutique.vendor}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {s.loading ? (
                                            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin ml-auto" />
                                        ) : s.error ? (
                                            <span className="text-xs text-red-500">{s.error}</span>
                                        ) : (
                                            <>
                                                <p className="font-bold text-slate-900">{formatCurrency(s.data?.totalRevenue || 0)}</p>
                                                <div className="flex flex-col gap-0">
                                                    <p className="text-xs text-emerald-600 font-medium">{s.data?.ordersCount || 0} cmds</p>
                                                    <p className="text-xs text-blue-600 font-medium">{s.data?.orderedProducts.reduce((sum, p) => sum + p.quantity, 0) || 0} produits</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
