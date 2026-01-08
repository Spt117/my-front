'use client';

import useCollectionStore from '@/app/shopify/[shopId]/collections/storeCollections';
import Selecteur from '@/components/selecteur';
import { boutiqueFromDomain, boutiques, TDomainsShopify } from '@/params/paramsShopify';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import useOrdersStore from '../shopify/orders/store';
import useShopifyStore from '../shopify/shopifyStore';
import SelectFull from './SelectFull';

export default function ShopifySelect() {
    const { ordersByShop } = useOrdersStore();
    const { shopifyBoutique, setShopifyBoutique, setProduct, product } = useShopifyStore();
    const { cleanCollections } = useCollectionStore();
    const path = usePathname();
    const router = useRouter();

    const getOrderCounts = (domain: TDomainsShopify) => {
        const groupedOrders = ordersByShop[domain] || [];
        let orderCount = 0;
        let preorderCount = 0;

        groupedOrders.forEach((grouped) => {
            // Regrouper les line items par ID de commande d'origine
            const itemsByOrder = new Map<string, any[]>();
            grouped.lineItems.edges.forEach((edge) => {
                const orderId = edge.node.orderId || grouped.id;
                if (!itemsByOrder.has(orderId)) itemsByOrder.set(orderId, []);
                itemsByOrder.get(orderId)!.push(edge.node);
            });

            // Pour chaque commande d'origine, déterminer si c'est une précommande
            itemsByOrder.forEach((items) => {
                const isPreorder = items.some((item) => item.variant?.product?.precommande?.value);
                if (isPreorder) {
                    preorderCount++;
                } else {
                    orderCount++;
                }
            });
        });

        return { orderCount, preorderCount };
    };

    const option2 = boutiques.map((boutique) => {
        const { orderCount, preorderCount } = getOrderCounts(boutique.domain);
        return {
            label: (
                <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                        {boutique.vendor}
                    </div>
                </div>
            ),
            value: boutique.domain,
            count: orderCount,
            preorderCount: preorderCount,
        };
    });



    function replaceShopifyId(url: string, newId: string | number) {
        // et tout ce qui suit
        const match = url.match(/\/shopify\/\d+\/([^\/]+)/);

        if (match) {
            const firstSlug = match[1];
            return `/shopify/${newId}/${firstSlug}/`;
        }

        // Si pas de slug après l'ID, retourne juste /shopify/[newId]/
        return url.replace(/\/shopify\/\d+\/?/, `/shopify/${newId}/`);
    }

    const handleSelectOrigin = (domain: string) => {
        const boutique = boutiqueFromDomain(domain as TDomainsShopify);
        setShopifyBoutique(boutique);
        cleanCollections();
        if (product) setProduct(null);

        if (path.includes('orders')) {
            router.push(`/shopify/${boutique.id}/orders`);
            return;
        }
        const newUrl = replaceShopifyId(path, boutique.id);
        router.push(newUrl);
    };

    return (
        <div className="">
            <Selecteur className="xl:hidden" array={option2} value={shopifyBoutique?.domain || ''} onChange={handleSelectOrigin} placeholder="Choisir l'origine" />
            <SelectFull action={handleSelectOrigin} options={option2} currentValue={shopifyBoutique?.domain || ''} />
        </div>
    );
}
