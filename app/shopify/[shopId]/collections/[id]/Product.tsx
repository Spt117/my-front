import useShopifyStore from '@/components/shopify/shopifyStore';
import { Eye, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { removeProductFromCollection } from '../server';
import useCollectionStore from '../storeCollections';
import { CollectionProduct } from '../utils';

export default function ProductCollection({ product }: { product: CollectionProduct }) {
    const { shopifyBoutique } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);
    const { dataCollection } = useCollectionStore();
    const router = useRouter();
    if (!shopifyBoutique || !dataCollection) return null;

    const handleClick = () => {
        const url = `/shopify/${shopifyBoutique?.id}/products/${product.id.replace('gid://shopify/Product/', '')}`;
        router.push(url);
    };

    const handleRemove = async () => {
        const res = await removeProductFromCollection(shopifyBoutique.domain, dataCollection.id, product.id);
        if (res.message) {
            toast.success(res.message);
            router.refresh();
        }
        if (res.error) toast.error(res.error);
    };

    const quantity = product.variants.nodes[0].inventoryQuantity;
    const txtClass = 'text-sm text-muted-foreground mt-1';

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex items-center gap-4 p-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                {product.featuredImage?.url ? (
                    <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-slate-300 font-bold uppercase">No image</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{product.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{product.variants.nodes[0].sku || 'PAS DE SKU'}</span>
                        <span className="text-sm font-medium text-slate-600">
                            {product.variants.nodes[0].price} {shopifyBoutique.devise}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 pr-4">
                <div className="flex flex-col items-end min-w-[80px]">
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                            quantity >= 10
                                ? 'bg-emerald-50 text-emerald-600'
                                : quantity >= 5
                                ? 'bg-amber-50 text-amber-600'
                                : quantity > 0
                                ? 'bg-orange-50 text-orange-600'
                                : 'bg-red-50 text-red-600'
                        }`}
                    >
                        {quantity} en stock
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{product.status === 'ACTIVE' ? 'En ligne' : 'Brouillon'}</span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={`https://${shopifyBoutique?.publicDomain}/products/${product.handle}`}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir sur la boutique"
                    >
                        <Eye size={18} />
                    </a>
                    {!dataCollection?.ruleSet && (
                        <button
                            title="Retirer de la collection"
                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
