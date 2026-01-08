import useShopifyStore from '@/components/shopify/shopifyStore';
import { myEvents } from '@/library/hooks/useEvent/classEvent';
import { ShopifyOrder } from '@/library/shopify/orders';
import { Archive } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { archiveOrder } from '../serverAction';
import UsefullLinks from '../UsefullLinks';

export default function OrderSearch({ order }: { order: ShopifyOrder }) {
    const { shopifyBoutique, setIsSearchOpen, setSearchTerm, setMySpinner } = useShopifyStore();

    
    if (!shopifyBoutique) return null;
    const orderId = order.id.split('/').pop();
    const url = `/shopify/${shopifyBoutique.id}/orders/${orderId}`;

    return (
        <div className="flex border-b last:border-0 hover:bg-gray-50/80 transition-all duration-200 group">
            <Link 
                href={url}
                onClick={() => setIsSearchOpen(false)}
                className="flex-1 flex items-center py-3 px-4 min-w-0"
            >
                <div className="relative w-12 h-12 flex-shrink-0 shadow-sm border border-gray-100 rounded-md overflow-hidden">
                    <Image
                        src={order.lineItems.edges[0]?.node?.variant?.product.featuredImage?.url || '/no_image.png'}
                        alt={order.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="48px"
                    />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{order.name}</h3>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {order.totalPriceSet.shopMoney.amount} {shopifyBoutique.devise}
                        </span>
                        {order.lineItems.edges.some(({ node }) => node.variant?.product.precommande?.value) && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Pre-order</span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">ID: {orderId}</p>
                </div>
            </Link>
            
            <div className="flex items-center gap-1 px-4 shrink-0">
                <UsefullLinks domain={shopifyBoutique.domain} orderId={order.id} country={order.shippingAddress.country} />
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMySpinner(true);
                        try {
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
                        } finally {
                            setMySpinner(false);
                        }
                    }}

                    className="p-2 rounded-lg bg-gray-50 hover:bg-amber-100 transition-all duration-200 group/btn cursor-pointer border border-gray-100 shadow-sm"
                    title="Archiver la commande"
                >
                    <Archive className="w-4 h-4 text-gray-400 group-hover/btn:text-amber-600" />
                </button>
            </div>
        </div>
    );
}
