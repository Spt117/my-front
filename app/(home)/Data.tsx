'use client';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { boutiques, TDomainsShopify } from '@/params/paramsShopify';
import { Calendar, ChevronDown, DollarSign, Package, PackagePlus, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsData, getAnalytics, OrderedProduct } from './serverAction';

type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'currentMonth' | 'currentYear' | 'year' | 'custom';

// ============ Helper Functions ============
function getDateRange(period: PeriodType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'today':
            return { start: today, end: now };
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { start: yesterday, end: new Date(today.getTime() - 1) };
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - 7);
            return { start: weekStart, end: now };
        case 'month':
            const monthStart = new Date(today);
            monthStart.setDate(monthStart.getDate() - 30);
            return { start: monthStart, end: now };
        case 'currentMonth':
            // Premier jour du mois en cours
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: currentMonthStart, end: now };
        case 'currentYear':
            // Premier jour de l'année en cours
            const currentYearStart = new Date(now.getFullYear(), 0, 1);
            return { start: currentYearStart, end: now };
        case 'year':
            // Les 12 derniers mois
            const yearStart = new Date(today);
            yearStart.setFullYear(yearStart.getFullYear() - 1);
            return { start: yearStart, end: now };
        case 'custom':
            return { start: customStart || today, end: customEnd || now };
        default:
            return { start: today, end: now };
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// ============ Components ============

function PeriodSelector({
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
}: {
    period: PeriodType;
    setPeriod: (p: PeriodType) => void;
    customStart: Date;
    setCustomStart: (d: Date) => void;
    customEnd: Date;
    setCustomEnd: (d: Date) => void;
}) {
    const periods: { value: PeriodType; label: string }[] = [
        { value: 'today', label: "Aujourd'hui" },
        { value: 'yesterday', label: 'Hier' },
        { value: 'week', label: '7 jours' },
        { value: 'month', label: '30 jours' },
        { value: 'currentMonth', label: 'Mois en cours' },
        { value: 'currentYear', label: 'Année en cours' },
        { value: 'year', label: '1 an' },
        { value: 'custom', label: 'Personnalisé' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <Calendar className="w-5 h-5 text-slate-600" />
            <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                            period === p.value
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-white/70 text-slate-600 hover:bg-white hover:shadow-md'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
            {period === 'custom' && (
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        type="date"
                        value={formatDate(customStart)}
                        onChange={(e) => setCustomStart(new Date(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                        type="date"
                        value={formatDate(customEnd)}
                        onChange={(e) => setCustomEnd(new Date(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon: Icon, gradient, subtitle }: { title: string; value: string | number; icon: React.ElementType; gradient: string; subtitle?: string }) {
    return (
        <Card className={`relative overflow-hidden border-0 shadow-xl ${gradient}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
            </CardContent>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        </Card>
    );
}

function ProductsTable({ products, shopDomain }: { products: OrderedProduct[]; shopDomain: TDomainsShopify }) {
    const [showAll, setShowAll] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: 'title' | 'sku' | 'quantity' | 'revenue'; direction: 'asc' | 'desc' } | null>(null);

    // Récupérer l'ID numérique de la boutique depuis le domain
    const boutique = boutiques.find((b) => b.domain === shopDomain);
    const shopId = boutique?.id;

    // Fonction pour extraire l'ID numérique du productId (gid://shopify/Product/123456 -> 123456)
    const extractProductId = (productId: string) => {
        const parts = productId.split('/');
        return parts[parts.length - 1];
    };

    // Tri des produits
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
        <div className="overflow-x-auto">
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
                            className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                            onClick={() => (window.location.href = `/shopify/${shopId}/products/${extractProductId(product.productId)}`)}
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

// ============ Main Component ============
export default function ShopifyDashboard() {
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();
    const [selectedShop, setSelectedShop] = useState<TDomainsShopify | null>(null);
    const [period, setPeriod] = useState<PeriodType>('today');
    const [customStart, setCustomStart] = useState<Date>(new Date());
    const [customEnd, setCustomEnd] = useState<Date>(new Date());
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shopifyBoutique) setShopifyBoutique(boutiques[0]);
    }, []);

    useEffect(() => {
        if (shopifyBoutique) setSelectedShop(shopifyBoutique.domain);
    }, [shopifyBoutique]);

    const fetchAnalytics = useCallback(async () => {
        if (!selectedShop) return;

        setLoading(true);
        setError(null);

        const { start, end } = getDateRange(period, customStart, customEnd);

        try {
            const res = await getAnalytics({
                domain: selectedShop,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            });

            if (res.error) {
                throw new Error(res.error);
            }

            setAnalytics(res.response);
        } catch (err) {
            console.error('Erreur lors du chargement des analytics:', err);
            setError('Impossible de charger les analytics');
        } finally {
            setLoading(false);
        }
    }, [selectedShop, period, customStart, customEnd]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (!selectedShop) return null;

    // Données pour les graphiques
    const topProducts = analytics?.orderedProducts.slice(0, 6) || [];
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Dashboard Analytics</h1>
                    <p className="text-slate-600">{shopifyBoutique?.publicDomain}</p>
                </div>

                {/* Period Selector */}
                <PeriodSelector period={period} setPeriod={setPeriod} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} />

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                        <span className="ml-3 text-slate-600">Chargement des analytics...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors">
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Analytics Content */}
                {!loading && !error && analytics && (
                    <>
                        {/* KPIs */}
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

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bar Chart - Top Produits */}
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

                            {/* Pie Chart - Répartition */}
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

                        {/* Products Table */}
                        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                    Détail des produits commandés
                                </CardTitle>
                                <CardDescription>Liste complète des produits vendus sur la période sélectionnée</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProductsTable products={analytics.orderedProducts} shopDomain={selectedShop} />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
