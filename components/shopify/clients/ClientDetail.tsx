'use client';

import { Card } from '@/components/ui/card';
import { useCopy } from '@/library/hooks/useCopy';
import { FullShopifyCustomer } from '@/library/shopify/clients';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import { ArrowLeft, Calendar, Clock, CreditCard, ExternalLink, Mail, MapPin, ShoppingBag, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import OrderCompact from '../orders/OrderCompact';

export default function ClientDetail({ client, shopId }: { client: FullShopifyCustomer; shopId: string }) {
    const { handleCopy } = useCopy();

    // Grouping orders if they are not already grouped (they should be coming from backend, but getOrdersByEmail returns ShopifyOrder[])
    // Wait, getOrdersByEmail in the router doesn't group them. Let's see if I should group them here.
    // In serverAction.ts for orders, they provide a groupOrdersByCustomerEmail helper.
    // However, for a single client, grouping by email might just mean merging multiple orders into one entry if the user wants.
    // Usually, for client detail, we want the list of all their individual orders.
    // But since OrderCompact expects GroupedShopifyOrder, let's adapt.

    const formattedOrders: GroupedShopifyOrder[] = client.orders
        .map((order) => ({
            ...order,
            name: Array.isArray(order.name) ? order.name : [order.name],
            legacyResourceId: Array.isArray(order.legacyResourceId) ? order.legacyResourceId : [order.legacyResourceId],
            shop: (client.shop || '') as any,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between">
                <Link href={`/shopify/${shopId}/clients`} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Retour à la liste des clients
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">ID: {client.id.split('/').pop()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Identity & Info */}
                <div className="space-y-6">
                    <Card className="p-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-black/5">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <User size={48} />
                                </div>
                                {client.defaultAddress && (
                                    <div className="absolute -bottom-2 -right-2 w-10 h-8 shadow-md rounded-lg overflow-hidden border-2 border-white">
                                        {(() => {
                                            const code =
                                                countries.getAlpha2Code(client.defaultAddress.country, 'fr') || countries.getAlpha2Code(client.defaultAddress.country, 'en');
                                            const FlagComponent = code ? Flags[code as keyof typeof Flags] : null;
                                            return FlagComponent ? <FlagComponent title={client.defaultAddress.country} /> : null;
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {client.firstName} {client.lastName}
                                </h1>
                                <button onClick={() => handleCopy(client.email)} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1">
                                    <Mail size={14} />
                                    {client.email}
                                </button>
                                <a
                                    href={`https://${client.shop}/admin/customers/${client.id.split('/').pop()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all group/shopify"
                                >
                                    <Image src="/shopify.png" alt="Shopify" width={20} height={20} className="object-contain" />
                                    <span>Voir sur Shopify</span>
                                    <ExternalLink size={14} className="text-gray-400 group-hover/shopify:text-blue-600 transition-colors" />
                                </a>
                            </div>

                            <div className="w-full pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-2">
                                {client.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-gray-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                    <Calendar size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">Client depuis</span>
                                    <span className="text-gray-900 font-semibold">
                                        {new Date(client.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {client.defaultAddress && (
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">Adresse par défaut</span>
                                        <span className="text-gray-900 font-semibold leading-tight">
                                            {client.defaultAddress.address1}
                                            <br />
                                            {client.defaultAddress.zip} {client.defaultAddress.city}, {client.defaultAddress.country}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Stats Card */}
                    <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-100 mb-6 flex items-center gap-2">
                            <Clock size={16} />
                            Statistiques
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-blue-100 text-xs font-medium">Commandes</p>
                                <p className="text-2xl font-bold flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-blue-200" />
                                    {client.numberOfOrders}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100 text-xs font-medium">Total dépensé</p>
                                <p className="text-2xl font-bold flex items-center gap-2 pr-2">
                                    <CreditCard size={20} className="text-blue-200" />
                                    <span className="truncate">
                                        {client.amountSpent.amount} {client.amountSpent.currencyCode}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Orders List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="text-blue-600" />
                            Historique des commandes
                        </h2>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">{formattedOrders.length} commandes</span>
                    </div>

                    <div className="space-y-4">
                        {formattedOrders.length > 0 ? (
                            formattedOrders.map((order, index) => <OrderCompact key={index} order={order} />)
                        ) : (
                            <div className="bg-white/40 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Aucune commande trouvée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
