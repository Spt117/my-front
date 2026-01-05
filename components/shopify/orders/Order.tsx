'use client';

import { Card } from '@/components/ui/card';
import { useCopy } from '@/library/hooks/useCopy';
import { myEvents } from '@/library/hooks/useEvent/classEvent';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { boutiqueFromDomain } from '@/params/paramsShopify';
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import { Archive, ArrowUpRight, Calendar, ExternalLink, Mail, MapPin, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import ProductSection from './ProductSection';
import { archiveOrder } from './serverAction';
import UsefullLinks from './UsefullLinks';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export default function Order({ order }: { order: GroupedShopifyOrder }) {
    const { handleCopy } = useCopy();
    const boutique = boutiqueFromDomain(order.shop);

    const getFulfillmentStatusStyle = (status: string) => {
        switch (status) {
            case 'FULFILLED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'UNFULFILLED':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PARTIALLY_FULFILLED':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING_FULFILLMENT':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getFinancialStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'REFUNDED':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'PARTIALLY_REFUNDED':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'AUTHORIZED':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const totalProducts = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card className="overflow-hidden border-0 shadow-xl bg-white/60 backdrop-blur-xl ring-1 ring-black/5 hover:bg-white/70 transition-colors duration-300">
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
                                <h2 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
                                    {order.name.map((name, index) => {
                                        const orderId = order.legacyResourceId[index] || order.id.split('/').pop();
                                        return (
                                            <Link
                                                key={index}
                                                href={`/shopify/${boutique.id}/orders/${orderId}`}
                                                className="group/title flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                                            >
                                                <span>{name}</span>
                                                <ExternalLink className="w-4 h-4 text-gray-300 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0" />
                                            </Link>
                                        );
                                    })}
                                    <div className="flex gap-2 ml-2">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${getFulfillmentStatusStyle(
                                                order.displayFulfillmentStatus
                                            )}`}
                                        >
                                            {order.displayFulfillmentStatus.replace('_', ' ')}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${getFinancialStatusStyle(
                                                order.displayFinancialStatus
                                            )}`}
                                        >
                                            {order.displayFinancialStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                </h2>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
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
                            <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
                                <UsefullLinks domain={boutique.domain} orderId={order.id} country={order.shippingAddress.country} />
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const res = await archiveOrder(order.shop, order.id);
                                        if (res.response) {
                                            toast.success('Commande archivée (mise à jour dans 3s)');
                                            setTimeout(() => {
                                                myEvents.emit('orders/paid', { shop: order.shop });
                                            }, 3000);
                                        } else {
                                            toast.error("Erreur lors de l'archivage");
                                        }
                                    }}
                                    className="p-1.5 rounded-lg bg-white/80 hover:bg-amber-100 transition-all duration-200 group cursor-pointer shadow-sm border border-gray-100"
                                    title="Archiver la commande"
                                >
                                    <Archive className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    <div
                                        className={`backdrop-blur px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-2 ${
                                            totalProducts > 1 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-white/90 text-indigo-700 border-indigo-100'
                                        }`}
                                    >
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
                                    href={`/shopify/${boutique.id}/clients/${order.customer.id.split('/').pop()}`}
                                    className="block bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group/customer"
                                >
                                    {(order.customer.firstName || order.customer.lastName) && (
                                        <p className="text-sm font-semibold text-gray-900 mb-1 group-hover/customer:text-blue-600 transition-colors">
                                            {order.customer.firstName} {order.customer.lastName}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 truncate pr-2 group-hover/customer:text-blue-600 transition-colors">
                                            {order.customer.email}
                                        </p>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/customer:opacity-100 group-hover/customer:text-blue-600 transition-all" />
                                    </div>
                                    <div className="mt-3 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 text-xs font-semibold border border-gray-200">
                                                {order.customer.numberOfOrders} commandes
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm bg-indigo-50/80 px-3 py-2 rounded-md border border-indigo-100">
                                            <span className="text-gray-600 font-medium">Dépensé :</span>
                                            <span className="font-bold text-indigo-700">
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
                                Détails des produits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {order.lineItems.edges.map(({ node }) => (
                                    <ProductSection key={node.id} node={node} domain={order.shop} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
