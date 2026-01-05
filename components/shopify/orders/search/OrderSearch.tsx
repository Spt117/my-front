import useShopifyStore from '@/components/shopify/shopifyStore';
import { myEvents } from '@/library/hooks/useEvent/classEvent';
import { ShopifyOrder } from '@/library/shopify/orders';
import { Archive } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { archiveOrder } from '../serverAction';
import useOrdersStore from '../store';
import UsefullLinks from '../UsefullLinks';

export default function OrderSearch({ order }: { order: ShopifyOrder }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!shopifyBoutique) return null;
    const url = `/shopify/${shopifyBoutique.id}/orders/${order.id.split('/').pop()}`;

    const { setOrdersSearch } = useOrdersStore();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Stocker l'URL avant toute modification d'état
        const targetUrl = url;
        // Navigation directe avec window.location (fiable même après démontage)
        window.location.href = targetUrl;
    };

    return (
        <div onClick={handleClick} className="w-full text-left block cursor-pointer">
            <div className="flex border-b last:border-0">
                <div className="w-min-0 flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                            src={order.lineItems.edges[0].node?.variant?.product.featuredImage.url || '/no_image.png'}
                            alt={order.name}
                            fill
                            className="object-cover rounded-md"
                            sizes="48px"
                            priority={false}
                        />
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground line-clamp-1">{order.name}</h3>
                            <span className="text-sm text-muted-foreground line-clamp-1">
                                {order.totalPriceSet.shopMoney.amount || 'Prix indisponible'} {shopifyBoutique.devise}
                            </span>
                            {order.lineItems.edges.some(({ node }) => node.variant?.product.precommande?.value) && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Pre-order</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {order.id.split('/').pop()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 mr-4">
                    <UsefullLinks domain={shopifyBoutique.domain} orderId={order.id} country={order.shippingAddress.country} />
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const res = await archiveOrder(shopifyBoutique.domain, order.id);
                            if (res.response) {
                                toast.success('Commande archivée (mise à jour dans 3s)');
                                setTimeout(() => {
                                    myEvents.emit('orders/paid', { shop: shopifyBoutique.domain });
                                    setSearchTerm('');
                                }, 3000);
                            } else {
                                toast.error("Erreur lors de l'archivage");
                            }
                        }}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-amber-100 transition-all duration-200 group cursor-pointer border border-gray-100"
                        title="Archiver la commande"
                    >
                        <Archive className="w-4 h-4 text-gray-500 group-hover:text-amber-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}
