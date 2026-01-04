'use client';

import { Card } from '@/components/ui/card';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { boutiqueFromDomain } from '@/params/paramsShopify';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderCompact({ order }: { order: GroupedShopifyOrder }) {
    const boutique = boutiqueFromDomain(order.shop);
    const totalProducts = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-0.5">
            <Card className="overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-xl ring-1 ring-black/5 hover:bg-white/80 transition-all duration-300">
                <div className="px-4 py-3">
                    {/* Header: Boutique & Order Info */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="bg-white rounded-full p-1 shadow-sm">
                                    <Image src={boutique.flag} alt={order.shop} width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <Link href={`/shopify/${boutique.id}/orders/${order.id.split('/').pop()}`} className="group/title">
                                    <h3 className="text-sm font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors flex items-center gap-2">
                                        {order.name[0]}
                                        {order.name.length > 1 && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">+{order.name.length - 1}</span>
                                        )}
                                        <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0 group-hover/title:text-blue-600" />
                                    </h3>
                                </Link>
                                <span className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                                {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                            </p>
                            <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {totalProducts} article{totalProducts > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Articles List */}
                    <div className="flex flex-wrap gap-2">
                        {order.lineItems.edges.map(({ node }, index) => {
                            const imageUrl = node.variant?.product.featuredImage?.url;
                            const idProduct = node.variant?.product.id.split('/').pop();
                            const url = `/shopify/${boutique.id}/products/${idProduct}`;

                            return (
                                <Link
                                    key={index}
                                    href={url}
                                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gradient-to-r from-gray-50/80 to-white hover:from-blue-50/80 hover:to-blue-100/50 transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md group"
                                >
                                    {/* Product Image */}
                                    {imageUrl && (
                                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
                                            <Image src={imageUrl} alt={node.title} fill className="object-cover" />
                                        </div>
                                    )}

                                    {/* Product Details */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-gray-900 whitespace-nowrap mb-1 group-hover:text-blue-600 transition-colors">{node.title}</h4>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-gray-500 whitespace-nowrap">
                                                <span className="font-medium text-gray-700">SKU:</span> {node.sku || 'N/A'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap">Qté: {node.quantity}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}
