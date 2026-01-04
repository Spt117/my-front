import { LineItemNode } from '@/library/shopify/orders';
import { boutiqueFromDomain, TDomainsShopify } from '@/params/paramsShopify';
import { AlertTriangle, ArrowUpRight, Box, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductSection({ node, domain }: { node: LineItemNode; domain: TDomainsShopify }) {
    const idProduct = node.variant?.product.id.split('/').pop();
    const boutique = boutiqueFromDomain(domain);
    const url = `/shopify/${boutique.id}/products/${idProduct}`;

    if (!node.variant) return null;

    return (
        <Link href={url} rel="noopener noreferrer" className="block h-full group">
            <div className="relative flex flex-row items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-100 hover:translate-y-[-2px] h-full overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-bl-3xl -mr-2 -mt-2 transition-all group-hover:bg-blue-50/50"></div>

                {/* Image Section */}
                <div className="relative w-20 h-20 min-w-[5rem] md:w-24 md:h-24 md:min-w-[6rem] rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <Image
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={node.variant?.product.featuredImage.url || '/no_image.png'}
                        alt={node.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-between flex-grow min-w-0 py-0.5 z-10">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-3 leading-tight group-hover:text-blue-600 transition-colors">
                                {node.title}
                            </h4>
                            <ArrowUpRight className="w-4 h-4 text-gray-300 opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                                <Tag className="w-3 h-3" />
                                {node.sku}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-50 md:border-none md:pt-0">
                        <div className="flex items-center gap-1.5">
                            <div className="text-indigo-600 font-bold text-sm md:text-base bg-indigo-50 px-2 py-0.5 rounded-md">
                                {node.variant.price} <span className="text-xs font-medium">{boutique.devise}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {node.quantity > 1 ? (
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5" />x{node.quantity}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-gray-400 text-xs font-medium px-2 py-1 rounded-full bg-gray-50">
                                    <Box className="w-3.5 h-3.5" />x{node.quantity}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
