import { getOrderById } from '@/components/shopify/serverActions';
import { ResponseServer } from '@/components/shopify/typesShopify';
import { LayoutPropsShopify } from '@/components/shopify/utils';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { boutiqueFromId } from '@/params/paramsShopify';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import OrderLayoutClient from './OrderLayoutClient';

export default async function OrderLayout({ children, params }: LayoutPropsShopify) {
    const { orderId, shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    let error = null;

    // Récupérer la commande depuis l'API Shopify
    const orderData = (await getOrderById(boutique.domain, `gid://shopify/Order/${orderId}`)) as ResponseServer<GroupedShopifyOrder> | null;

    error = orderData?.error || null;
    const data = orderData?.response || null;

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">Commande introuvable</p>
                    <Link href={`/shopify/${shopId}/orders`} className="text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux commandes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <OrderLayoutClient error={error} data={data} shopId={shopId}>
            {children}
        </OrderLayoutClient>
    );
}
