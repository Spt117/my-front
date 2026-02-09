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
    const orderData = (await getOrderById(boutique?.domain || "", `gid://shopify/Order/${orderId}`)) as ResponseServer<GroupedShopifyOrder> | null;

    error = orderData?.error || null;
    const data = orderData?.response || null;

    return (
        <OrderLayoutClient error={error} data={data} shopId={shopId}>
            {children}
        </OrderLayoutClient>
    );
}
