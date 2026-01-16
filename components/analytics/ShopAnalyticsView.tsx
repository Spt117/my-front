'use client';

import { AnalyticsData, getAnalytics } from '@/app/(home)/serverAction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IShopify, TDomainsShopify } from '@/params/paramsShopify';
import { DollarSign, Package, PackagePlus, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsProductsTable } from './AnalyticsProductsTable';
import { CreatedProductsTable } from './CreatedProductsTable';
import { formatCurrency, getDateRange, PeriodType } from './AnalyticsUtils';
import { KPICard } from './KPICard';

interface ShopAnalyticsViewProps {
    boutique: IShopify;
    period: PeriodType;
    customStart: Date;
    customEnd: Date;
}

export function ShopAnalyticsView({ boutique, period, customStart, customEnd }: ShopAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { start, end } = getDateRange(period, customStart, customEnd);

        try {
            const res = await getAnalytics({
                domain: boutique.domain,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            });

            if (res.error) {
                throw new Error(res.error);
            }

            setAnalytics(res.response);
        } catch (err) {
            console.error('Erreur lors du chargement des analytics:', err);
            setError('Impossible de charger les analytics pour ' + boutique.publicDomain);
        } finally {
            setLoading(false);
        }
    }, [boutique, period, customStart, customEnd]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <span className="ml-3 text-slate-600">Chargement des analytics pour {boutique.publicDomain}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors">
                    Réessayer
                </button>
            </div>
        );
    }

    if (!analytics) return null;

    const topProducts = analytics.orderedProducts.slice(0, 6);
    const chartData = topProducts.map((p) => ({
        name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
        quantité: p.quantity,
        CA: p.revenue,
    }));

    const pieData = topProducts.map((p) => ({
        name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
        value: p.quantity,
    }));

    const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Commandes"
                    value={analytics.ordersCount}
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600"
                    subtitle="sur la période"
                />
                <KPICard
                    title="Chiffre d'Affaires"
                    value={formatCurrency(analytics.totalRevenue)}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600"
                    subtitle="total encaissé"
                />
                <KPICard
                    title="Produits commandés"
                    value={analytics.orderedProducts.reduce((sum, p) => sum + p.quantity, 0)}
                    icon={Package}
                    gradient="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600"
                    subtitle={`${analytics.orderedProducts.length} références`}
                />
                <KPICard
                    title="Produits créés"
                    value={analytics.productsCreatedCount}
                    icon={PackagePlus}
                    gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600"
                    subtitle="nouveaux produits"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Top 6 - Produits vendus</CardTitle>
                        <CardDescription>Quantités vendues par produit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar dataKey="quantité" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">Aucune donnée disponible</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Répartition des ventes</CardTitle>
                        <CardDescription>Par quantité vendue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
                                        outerRadius={90}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">Aucune donnée disponible</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        Détail des produits commandés
                    </CardTitle>
                    <CardDescription>Liste complète des produits vendus sur la période sélectionnée</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnalyticsProductsTable products={analytics.orderedProducts} shopDomain={boutique.domain} />
                </CardContent>
            </Card>
        </div>
    );
}
