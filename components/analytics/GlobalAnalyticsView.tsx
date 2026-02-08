"use client";

import { AnalyticsData, getAllAnalytics } from "@/app/(home)/serverAction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { boutiques, IShopify } from "@/params/paramsShopify";
import { DollarSign, ExternalLink, FileEdit, Package, PackagePlus, RefreshCw, ShoppingCart, Store, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsProductsTable } from "./AnalyticsProductsTable";
import { formatCurrency, getDateRange, PeriodType } from "./AnalyticsUtils";
import { KPICard } from "./KPICard";

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
    const [stats, setStats] = useState<BoutiqueStats[]>(boutiques.map((b) => ({ boutique: b, data: null, loading: true, error: null })));

    const fetchAllAnalytics = useCallback(async () => {
        const { start, end } = getDateRange(period, customStart, customEnd);

        setStats((prev) => prev.map((s) => ({ ...s, loading: true, error: null })));

        try {
            const res = await getAllAnalytics({
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            });

            if (res.error || !res.response) {
                setStats((prev) => prev.map((s) => ({ ...s, loading: false, error: "Erreur serveur" })));
                return;
            }

            setStats((prev) =>
                prev.map((s) => {
                    const result = res.response!.find((r) => r.domain === s.boutique.domain);
                    if (!result) return { ...s, loading: false, error: "Boutique non trouvée" };
                    return { ...s, data: result.data, loading: false, error: result.error };
                })
            );
        } catch (err) {
            setStats((prev) => prev.map((s) => ({ ...s, loading: false, error: "Erreur" })));
        }
    }, [period, customStart, customEnd]);

    useEffect(() => {
        fetchAllAnalytics();
    }, [fetchAllAnalytics]);

    const totalRevenue = stats.reduce((sum, s) => sum + (s.data?.totalRevenue || 0), 0);
    const totalRefunds = stats.reduce((sum, s) => sum + (s.data?.totalRefunds || 0), 0);
    const totalOrders = stats.reduce((sum, s) => sum + (s.data?.ordersCount || 0), 0);
    const totalProducts = stats.reduce((sum, s) => sum + (s.data?.orderedProducts.reduce((pSum, p) => pSum + p.quantity, 0) || 0), 0);
    const totalCreated = stats.reduce((sum, s) => sum + (s.data?.productsCreatedCount || 0), 0);
    const totalDrafts = stats.reduce((sum, s) => sum + (s.data?.draftProductsCount || 0), 0);
    const allLoading = stats.some((s) => s.loading);

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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    title="Remboursements"
                    value={formatCurrency(totalRefunds)}
                    icon={RefreshCw}
                    gradient="bg-gradient-to-br from-red-600 via-rose-600 to-red-700"
                    subtitle="Total remboursements"
                />
                <KPICard
                    title="Produits Vendus"
                    value={totalProducts}
                    icon={Package}
                    gradient="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700"
                    subtitle="Nombre d'articles expédiés"
                />
                <KPICard
                    title="Produits Créés"
                    value={totalCreated}
                    icon={PackagePlus}
                    gradient="bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700"
                    subtitle="Nouveaux produits ajoutés"
                />
                <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-600 via-gray-600 to-slate-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                <FileEdit className="w-4 h-4 text-white" />
                            </div>
                            Produits en Brouillon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {allLoading && totalDrafts === 0 ? "..." : totalDrafts}
                        </div>
                        <div className="mt-2 space-y-1">
                            {stats.map((s) => {
                                const count = s.data?.draftProductsCount ?? 0;
                                return (
                                    <a
                                        key={s.boutique.domain}
                                        href={`/shopify/${s.boutique.id}/draft`}
                                        className="flex items-center justify-between text-xs text-white/80 hover:text-white transition-colors group"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <img src={s.boutique.flag} alt="" className="w-3.5 h-3.5 object-contain" />
                                            <span className="truncate">{s.boutique.publicDomain}</span>
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold">
                                            {s.loading ? "..." : count}
                                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                </Card>
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
                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                    <Bar
                                        dataKey="CA"
                                        radius={[0, 8, 8, 0]}
                                        shape={(props: any) => <Rectangle {...props} fill={props.index === 0 ? "#8b5cf6" : "#a855f7"} opacity={1 - props.index * 0.15} />}
                                    />
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
                                <a
                                    key={s.boutique.domain}
                                    href={`https://admin.shopify.com/store/${s.boutique.domain.replace(".myshopify.com", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 flex items-center justify-between hover:bg-purple-50/50 transition-all cursor-pointer group/row"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover/row:scale-110 transition-transform">
                                            <img src={s.boutique.flag} alt={s.boutique.langue} className="w-6 h-6 object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-800 text-sm whitespace-nowrap">{s.boutique.publicDomain}</p>
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/row:text-purple-500 transition-colors" />
                                            </div>
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
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        {s.data?.orderedProducts.reduce((sum, p) => sum + p.quantity, 0) || 0} produits
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Global Products Table */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        Top des produits vendus (Global)
                    </CardTitle>
                    <CardDescription>Liste agrégée de tous les produits vendus sur toutes les boutiques</CardDescription>
                </CardHeader>
                <CardContent>
                    {(() => {
                        const allProducts: any[] = [];
                        stats.forEach((s) => {
                            if (s.data?.orderedProducts) {
                                allProducts.push(...s.data.orderedProducts);
                            }
                        });

                        const groupedProducts = allProducts.reduce((acc: Record<string, any>, curr) => {
                            const key = curr.sku || curr.title;
                            if (!acc[key]) {
                                acc[key] = { ...curr };
                            } else {
                                acc[key].quantity += curr.quantity;
                                acc[key].revenue += curr.revenue;
                                if (!acc[key].imageUrl && curr.imageUrl) {
                                    acc[key].imageUrl = curr.imageUrl;
                                }
                            }
                            return acc;
                        }, {});

                        const finalProducts = Object.values(groupedProducts).sort((a: any, b: any) => b.revenue - a.revenue);

                        return <AnalyticsProductsTable products={finalProducts as any} />;
                    })()}
                </CardContent>
            </Card>
        </div>
    );
}
