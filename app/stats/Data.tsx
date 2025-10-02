"use client";
import { ProductNode } from "@/components/header/products/shopifySearch";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface DataShops {
    count: number;
    products: ProductNode[];
}

export default function ShopifyDashboard({ data }: { data: Record<TDomainsShopify, DataShops> }) {
    const { shopifyBoutique, setShopifyBoutique } = useShopifyStore();
    const [selectedShop, setSelectedShop] = useState<TDomainsShopify | null>(null);

    useEffect(() => {
        if (!shopifyBoutique) setShopifyBoutique(boutiques[0]);
    }, []);

    useEffect(() => {
        if (shopifyBoutique) setSelectedShop(shopifyBoutique.domain);
    }, [shopifyBoutique]);

    if (!selectedShop) return null;
    const activeShop = data[selectedShop];

    // Calculs des statistiques
    const totalRevenue = activeShop.products.reduce((sum, p) => sum + parseFloat(p.variants.edges[0].node.price), 0);
    const avgPrice = activeShop.count > 0 ? totalRevenue / activeShop.count : 0;

    // Données par type de produit
    const productTypeData = Object.entries(
        activeShop.products.reduce((acc: Record<string, number>, p) => {
            acc[p.productType] = (acc[p.productType] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    // Données de prix par type
    const priceByType = Object.entries(
        activeShop.products.reduce((acc: Record<string, { total: number; count: number }>, p) => {
            if (!acc[p.productType]) acc[p.productType] = { total: 0, count: 0 };
            acc[p.productType].total += parseFloat(p.variants.edges[0].node.price);
            acc[p.productType].count += 1;
            return acc;
        }, {})
    ).map(([name, data]) => ({
        name,
        prix_moyen: (data.total / data.count).toFixed(2),
        total: data.total.toFixed(2),
    }));

    // Distribution des prix
    const priceDistribution = activeShop.products
        .map((p) => ({ name: p.title.substring(0, 20) + "...", prix: parseFloat(p.variants.edges[0].node.price) }))
        .sort((a, b) => b.prix - a.prix)
        .slice(0, 8);

    const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#6366f1"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-slate-900">Dashboard Shopify</h1>
                    <p className="text-slate-600">Analyse des boutiques et produits</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Produits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{activeShop.count}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Prix moyen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{avgPrice.toFixed(2)}€</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Valeur totale
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalRevenue.toFixed(2)}€</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{productTypeData.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Répartition par type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition par type</CardTitle>
                            <CardDescription>Nombre de produits par catégorie</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={productTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {productTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Prix par type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Prix moyens par type</CardTitle>
                            <CardDescription>Analyse des prix par catégorie</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={priceByType}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="prix_moyen" fill="#8b5cf6" name="Prix moyen (€)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Distribution des prix */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Top 8 - Produits par prix</CardTitle>
                            <CardDescription>Les produits les plus chers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart
                                    data={priceDistribution}
                                    margin={{ top: 8, right: 12, bottom: 56, left: 8 }} // espace pour la légende + labels X
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />

                                    {/* Légende en bas + hauteur réservée */}
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        height={32} // réserve de la place dans le chart
                                        wrapperStyle={{ bottom: -20 }} // ancre visuelle au bas du conteneur
                                    />

                                    <Line type="monotone" dataKey="prix" stroke="#3b82f6" strokeWidth={2} name="Prix (€)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
