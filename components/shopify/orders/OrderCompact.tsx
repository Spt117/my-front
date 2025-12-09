'use client';

import { Card } from '@/components/ui/card';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { boutiqueFromDomain } from '@/params/paramsShopify';
import Image from 'next/image';

export default function OrderCompact({ order }: { order: GroupedShopifyOrder }) {
    const boutique = boutiqueFromDomain(order.shop);
    const totalProducts = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);

    return (
        <div className="container mx-auto px-4 py-0.5">
            <Card className="overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-xl ring-1 ring-black/5 hover:bg-white/80 transition-all duration-300">
                <div className="px-1 flex items-center justify-between gap-3">
                    {/* Left: Boutique & Order Info */}
                    <div className="flex items-center gap-4 min-w-[300px]">
                        <div className="relative shrink-0">
                            <div className="bg-white rounded-full p-1 shadow-sm">
                                <Image src={boutique.flag} alt={order.shop} width={32} height={32} className="rounded-full w-8 h-8 object-cover" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                {order.name[0]}
                                {order.name.length > 1 && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">+{order.name.length - 1}</span>
                                )}
                            </h3>
                            <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Middle: Product Images */}
                    <div className="flex-1 flex justify-center overflow-hidden px-4">
                        <div className="flex items-center -space-x-2 overflow-x-auto no-scrollbar py-0.5">
                            {order.lineItems.edges.slice(0, 10).map(({ node }, i) => {
                                const imageUrl = node.variant?.product.featuredImage?.url;
                                return (
                                    imageUrl && (
                                        <div key={i} className="relative w-8 h-8 shrink-0 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                                            <Image src={imageUrl} alt={node.title} fill className="object-cover" />
                                        </div>
                                    )
                                );
                            })}
                            {order.lineItems.edges.length > 10 && (
                                <div className="w-8 h-8 shrink-0 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 z-0">
                                    +{order.lineItems.edges.length - 10}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Price & Products Count */}
                    <div className="flex items-center gap-6 min-w-[150px] justify-end">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                                {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                            </p>
                            <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                {totalProducts} article{totalProducts > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
