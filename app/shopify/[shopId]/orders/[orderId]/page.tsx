'use client';

import FulfillProductSection from '@/components/shopify/orders/FulfillProductSection';
import { getOrderById } from '@/components/shopify/orders/serverAction';
import useOrdersStore from '@/components/shopify/orders/store';
import UsefullLinks from '@/components/shopify/orders/UsefullLinks';
import { Card } from '@/components/ui/card';
import { useCopy } from '@/library/hooks/useCopy';
import { boutiqueFromDomain } from '@/params/paramsShopify';
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import { ArrowLeft, ArrowUpRight, Calendar, ExternalLink, Mail, MapPin, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export default function OrderDetailPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const { handleCopy } = useCopy();
    const { orders, setOrders } = useOrdersStore();

    // Les données sont déjà chargées par le layout
    const order = orders[0];

    const handleOrderUpdated = async () => {
        if (!order) return;
        const updatedOrder = await getOrderById({ orderId: order.id, domain: order.shop });
        if (updatedOrder) {
            setOrders([updatedOrder]);
        }
    };

    if (!order) {
        return null; // Le layout gère déjà le cas où il n'y a pas de commande
    }

    const boutique = boutiqueFromDomain(order.shop);
    const totalProducts = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button */}
                <Link href={`/shopify/${shopId}/orders`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Retour aux commandes</span>
                </Link>

                <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative group cursor-pointer transition-transform hover:scale-105">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
                                    <div className="relative bg-white rounded-full p-1.5 shadow-sm">
                                        <Image src={boutique.flag} alt={order.shop} width={48} height={48} className="rounded-full w-12 h-12 object-cover" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-1 flex-wrap">
                                        {order.name.map((name, index) => (
                                            <a
                                                key={index}
                                                href={`https://${order.shop}/admin/orders/${order.legacyResourceId[index]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-blue-600 flex items-center gap-1 transition-colors bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm hover:shadow-md"
                                            >
                                                <span className="font-mono text-xs">{name}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {/* Status badges */}
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.displayFulfillmentStatus === 'FULFILLED'
                                                ? 'bg-green-100 text-green-700'
                                                : order.displayFulfillmentStatus === 'PARTIALLY_FULFILLED'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-orange-100 text-orange-700'
                                        }`}
                                    >
                                        {order.displayFulfillmentStatus === 'FULFILLED'
                                            ? '✓ Traité'
                                            : order.displayFulfillmentStatus === 'PARTIALLY_FULFILLED'
                                            ? '◐ Partiel'
                                            : '○ Non traité'}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.displayFinancialStatus === 'PAID'
                                                ? 'bg-green-100 text-green-700'
                                                : order.displayFinancialStatus === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {order.displayFinancialStatus === 'PAID'
                                            ? '💰 Payé'
                                            : order.displayFinancialStatus === 'PENDING'
                                            ? '⏳ En attente'
                                            : order.displayFinancialStatus}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
                                    <UsefullLinks domain={boutique.domain} orderId={order.id} country={order.shippingAddress.country} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Stats & Info (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative">
                                    <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-1 flex items-center gap-2">Total Commande</p>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{order.totalPriceSet.shopMoney.amount}</span>
                                        <span className="text-xl font-medium text-gray-500">{order.totalPriceSet.shopMoney.currencyCode}</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="bg-white/90 backdrop-blur text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4" />
                                            <span className="font-bold text-sm">
                                                {totalProducts} Produit{totalProducts > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-5">
                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Livraison</h3>
                                    </div>
                                    <div className="pl-6 border-l-2 border-gray-200 ml-2 py-1">
                                        <p className="text-sm text-gray-700 font-medium">{order.shippingAddress.address1}</p>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            {order.shippingAddress.city}, {order.shippingAddress.country}
                                            {(() => {
                                                const code =
                                                    countries.getAlpha2Code(order.shippingAddress.country, 'fr') || countries.getAlpha2Code(order.shippingAddress.country, 'en');
                                                const FlagComponent = code ? Flags[code as keyof typeof Flags] : null;

                                                return FlagComponent ? (
                                                    <div className="w-5 h-4 shadow-sm rounded-[2px] overflow-hidden inline-flex">
                                                        <FlagComponent title={order.shippingAddress.country} />
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">Client</h3>
                                    </div>
                                    <Link
                                        href={`/shopify/${shopId}/clients/${order.customer.id.split('/').pop()}`}
                                        className="block bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group/customer relative overflow-hidden ring-1 ring-black/[0.02]"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                        {(order.customer.firstName || order.customer.lastName) && (
                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 ring-2 ring-white">
                                                    {order.customer.firstName?.[0]}
                                                    {order.customer.lastName?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-bold text-gray-900 group-hover/customer:text-blue-600 transition-colors flex items-center justify-between">
                                                        {order.customer.firstName} {order.customer.lastName}
                                                        <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover/customer:opacity-100 group-hover/customer:text-blue-600 transition-all" />
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block">Voir le profil</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-semibold text-gray-700 truncate pr-2 group-hover/customer:text-blue-600 transition-colors">
                                                {order.customer.email}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                <Package className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-700">{order.customer.numberOfOrders} cmds</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50 shadow-sm">
                                                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">Total :</span>
                                                <span className="text-xs font-bold text-indigo-700">
                                                    {order.customer.amountSpent.amount} {order.customer.amountSpent.currencyCode}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Products (8 cols) */}
                        <div className="lg:col-span-8">
                            <div className="bg-gray-50/30 rounded-2xl p-6 border border-gray-100 h-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-500" />
                                    Traiter les produits
                                </h3>

                                {/* Section de fulfillment - le composant gère lui-même le filtrage */}
                                <FulfillProductSection lineItems={order.lineItems.edges} domain={order.shop} orderId={order.id} onOrderUpdated={handleOrderUpdated} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
