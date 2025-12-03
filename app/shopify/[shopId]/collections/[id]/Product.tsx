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
            className="py-4 hover:bg-accent transition-colors flex items-center gap-4 cursor-pointer"
            onClick={handleClick}
        >
            {product.featuredImage?.url ? (
                <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} className="object-cover rounded" width={60} height={60} />
            ) : (
                <div className="w-[60px] h-[60px] bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-xs">Aucune image</span>
                </div>
            )}
            <div className="flex items-center justify-between w-full gap-4">
                <div className="flex flex-col ">
                    <h2 className="text-lg font-semibold ">{product.title}</h2>
                    <p className={txtClass}>
                        {product.variants.nodes[0].price}
                        {shopifyBoutique.devise}
                    </p>
                    <p className={`${quantity < 6 ? 'text-red-500 font-bold' : txtClass}`}>Quantité: {quantity}</p>
                    <div className={txtClass}>Sku : {product.variants.nodes[0].sku || 'N/A'}</div>
                </div>
                <div className="flex items-center justify-center h-14 gap-5 mr-4">
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={`https://${shopifyBoutique?.publicDomain}/products/${product.handle}`}
                        className="p-1 hover:bg-gray-200 rounded-md right-3 "
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span title="Afficher sur votre boutique" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                            <Eye size={20} color={isHovered ? 'currentColor' : 'transparent'} />
                        </span>
                    </a>
                    {!dataCollection?.ruleSet && (
                        <span
                            title="Retirer de la collection"
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <X color={isHovered ? 'currentColor' : 'transparent'} onClick={handleRemove} />
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-center h-14 gap-5 mr-4">
                    <span className="text-muted-foreground text-xs">{product.status}</span>
                </div>
            </div>
        </div>
    );
}
