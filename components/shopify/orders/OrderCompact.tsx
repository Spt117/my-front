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
import { Archive, ArrowUpRight, CalendarClock, ChevronDown, ChevronUp, ExternalLink, Mail, MapPin, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import ProductSection from './ProductSection';
import { archiveOrder } from './serverAction';
import UsefullLinks from './UsefullLinks';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

interface OrderCompactProps {
    order: GroupedShopifyOrder;
    hiddenPreorderCount?: number; // Number of preorder items hidden from this order
}

export default function OrderCompact({ order, hiddenPreorderCount = 0 }: OrderCompactProps) {
    const { handleCopy } = useCopy();
    const boutique = boutiqueFromDomain(order.shop);
    const totalProducts = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);
    const [isExpanded, setIsExpanded] = useState(false);

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

    const pathname = usePathname();
    const isClientPage = pathname.includes('/clients/');

    return (
        <div className="container mx-auto px-4 py-0.5">
            <Card className="overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-xl ring-1 ring-black/5 hover:bg-white/80 transition-all duration-300">
                <div className="px-4 py-3">
                    {/* Header: Boutique & Order Info */}
                    <div className="flex items-center justify-between gap-4 overflow-hidden mb-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="relative shrink-0">
                                <div className="bg-white rounded-full p-1 shadow-sm">
                                    <Image src={boutique.flag} alt={order.shop} width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
                                </div>
                            </div>

                            <div className="flex flex-col min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
                                    {order.name.map((name, index) => {
                                        const orderId = order.legacyResourceId[index] || order.id.split('/').pop();
                                        return (
                                            <Link key={index} href={`/shopify/${boutique.id}/orders/${orderId}`} className="group/title">
                                                <h3 className="text-sm font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors flex items-center gap-1.5">
                                                    {name}
                                                    <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0 group-hover/title:text-blue-600" />
                                                </h3>
                                            </Link>
                                        );
                                    })}
                                    {order.lineItems.edges.some(({ node }) => node.variant?.product.precommande?.value) && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-blue-100 border border-blue-200 uppercase tracking-wider">
                                            Précommande
                                        </span>
                                    )}
                                    {hiddenPreorderCount > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-wider" title={`${hiddenPreorderCount} précommande(s) en attente pour ce client`}>
                                            <CalendarClock size={10} />
                                            +{hiddenPreorderCount} préco
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                    {!isClientPage && (
                                        <>
                                            <Link href={`/shopify/${boutique.id}/clients/${order.customer.id.split('/').pop()}`} className="hover:opacity-80 transition-opacity">
                                                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {order.customer.numberOfOrders} cmds
                                                </span>
                                            </Link>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                        </>
                                    )}
                                    <div className="flex gap-1 overflow-hidden items-center">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-normal whitespace-nowrap ${getFulfillmentStatusStyle(
                                                order.displayFulfillmentStatus
                                            )}`}
                                        >
                                            {order.displayFulfillmentStatus.replace('_', ' ')}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-normal whitespace-nowrap ${getFinancialStatusStyle(
                                                order.displayFinancialStatus
                                            )}`}
                                        >
                                            {order.displayFinancialStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 ml-1">
                                <UsefullLinks domain={order.shop} orderId={order.id} country={order.shippingAddress.country} />
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
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 transition-all duration-200 group cursor-pointer"
                                    title="Archiver la commande"
                                >
                                    <Archive className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                                </button>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">
                                    {order.totalPriceSet.shopMoney.amount} <span className="text-xs font-medium">{boutique.devise}</span>
                                </p>
                                <p
                                    className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 border transition-all ${
                                        totalProducts > 1 ? 'text-red-700 bg-red-50 border-red-100 animate-pulse' : 'text-indigo-700 bg-indigo-50 border-indigo-100'
                                    }`}
                                >
                                    {totalProducts} ITEM{totalProducts > 1 ? 'S' : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="ml-1 p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 transition-all duration-200 group cursor-pointer"
                                title={isExpanded ? 'Masquer les détails' : 'Afficher les détails'}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column: Shipping & Info */}
                                <div className={isClientPage ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4' : 'lg:col-span-4 space-y-4'}>
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md ring-1 ring-black/[0.02]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900">Livraison</h3>
                                        </div>
                                        <div className="space-y-1 pl-1">
                                            <p className="text-sm text-gray-800 font-bold">{order.shippingAddress.address1}</p>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {order.shippingAddress.zip} {order.shippingAddress.city}, {order.shippingAddress.country}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const code =
                                                            countries.getAlpha2Code(order.shippingAddress.country, 'fr') ||
                                                            countries.getAlpha2Code(order.shippingAddress.country, 'en');
                                                        const FlagComponent = code ? Flags[code as keyof typeof Flags] : null;

                                                        return FlagComponent ? (
                                                            <div className="w-6 h-4 shadow-sm rounded-sm overflow-hidden inline-flex border border-gray-100">
                                                                <FlagComponent title={order.shippingAddress.country} />
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                        {order.shippingAddress.country}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!isClientPage && (
                                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md ring-1 ring-black/[0.02]">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900">Client</h3>
                                            </div>
                                            <Link href={`/shopify/${boutique.id}/clients/${order.customer.id.split('/').pop()}`} className="group/cust block">
                                                <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 group-hover/cust:border-blue-200 group-hover/cust:bg-white transition-all duration-300">
                                                    <p className="text-sm font-bold text-gray-900 group-hover/cust:text-blue-600 transition-colors flex items-center justify-between">
                                                        {order.customer.firstName} {order.customer.lastName}
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/cust:opacity-100 transition-all" />
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 truncate font-medium">{order.customer.email}</p>
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                                                            {order.customer.numberOfOrders} Commandes
                                                        </span>
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                                                            {order.customer.amountSpent.amount} {order.customer.amountSpent.currencyCode}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Products */}
                                <div className={isClientPage ? 'lg:col-span-12' : 'lg:col-span-8'}>
                                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                Détails du panier
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                                <ShoppingBag size={12} />
                                                {totalProducts} ARTICLE{totalProducts > 1 ? 'S' : ''}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {order.lineItems.edges.map(({ node }) => (
                                                <ProductSection key={node.id} node={node} domain={order.shop} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Articles List - Only show when not expanded */}
                    {!isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-2">
                            {order.lineItems.edges.map(({ node }, index) => {
                                const imageUrl = node.variant?.product.featuredImage?.url;
                                const idProduct = node.variant?.product.id.split('/').pop();
                                const url = `/shopify/${boutique.id}/products/${idProduct}`;

                                return (
                                    <Link
                                        key={index}
                                        href={url}
                                        className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300 border border-transparent group min-w-0"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
                                            {imageUrl ? (
                                                <Image src={imageUrl} alt={node.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <Package className="w-5 h-5 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <h4 className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors leading-snug mb-1">
                                                {node.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                        node.quantity > 1 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-indigo-100 text-indigo-700'
                                                    }`}
                                                >
                                                    x{node.quantity}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md truncate uppercase tracking-normal border border-gray-200">
                                                    {node.sku}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
